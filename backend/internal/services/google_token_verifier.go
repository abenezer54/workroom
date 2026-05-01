package services

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const googleJWKSURL = "https://www.googleapis.com/oauth2/v3/certs"

type GoogleIdentity struct {
	Subject       string
	Email         string
	Name          string
	EmailVerified bool
}

type GoogleTokenVerifier interface {
	Verify(ctx context.Context, credential string, audience string) (*GoogleIdentity, error)
}

type googleTokenVerifier struct {
	client    *http.Client
	certsURL  string
	mu        sync.Mutex
	keys      map[string]*rsa.PublicKey
	expiresAt time.Time
}

type googleIDTokenClaims struct {
	Email         string `json:"email"`
	Name          string `json:"name"`
	EmailVerified bool   `json:"email_verified"`
	jwt.RegisteredClaims
}

type googleJWKSet struct {
	Keys []googleJWK `json:"keys"`
}

type googleJWK struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Alg string `json:"alg"`
	Use string `json:"use"`
	N   string `json:"n"`
	E   string `json:"e"`
}

func NewGoogleTokenVerifier() GoogleTokenVerifier {
	return &googleTokenVerifier{
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
		certsURL: googleJWKSURL,
	}
}

func (v *googleTokenVerifier) Verify(ctx context.Context, credential string, audience string) (*GoogleIdentity, error) {
	credential = strings.TrimSpace(credential)
	audience = strings.TrimSpace(audience)
	if credential == "" || audience == "" {
		return nil, fmt.Errorf("missing google credential or audience")
	}

	claims := &googleIDTokenClaims{}
	parser := jwt.NewParser(
		jwt.WithValidMethods([]string{jwt.SigningMethodRS256.Alg()}),
		jwt.WithAudience(audience),
		jwt.WithExpirationRequired(),
		jwt.WithIssuedAt(),
		jwt.WithLeeway(2*time.Minute),
	)

	token, err := parser.ParseWithClaims(credential, claims, func(token *jwt.Token) (interface{}, error) {
		kid, ok := token.Header["kid"].(string)
		if !ok || strings.TrimSpace(kid) == "" {
			return nil, fmt.Errorf("missing key id")
		}

		return v.publicKey(ctx, kid)
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid google token")
	}
	if claims.Issuer != "https://accounts.google.com" && claims.Issuer != "accounts.google.com" {
		return nil, fmt.Errorf("invalid google token issuer")
	}

	identity := &GoogleIdentity{
		Subject:       strings.TrimSpace(claims.Subject),
		Email:         strings.ToLower(strings.TrimSpace(claims.Email)),
		Name:          strings.TrimSpace(claims.Name),
		EmailVerified: claims.EmailVerified,
	}
	if identity.Subject == "" || identity.Email == "" {
		return nil, fmt.Errorf("google token missing subject or email")
	}

	return identity, nil
}

func (v *googleTokenVerifier) publicKey(ctx context.Context, kid string) (*rsa.PublicKey, error) {
	now := time.Now().UTC()

	v.mu.Lock()
	key, hasKey := v.keys[kid]
	cacheFresh := !v.expiresAt.IsZero() && now.Before(v.expiresAt)
	v.mu.Unlock()

	if hasKey && cacheFresh {
		return key, nil
	}

	if err := v.refreshKeys(ctx); err != nil {
		if hasKey {
			return key, nil
		}
		return nil, err
	}

	v.mu.Lock()
	defer v.mu.Unlock()

	key, hasKey = v.keys[kid]
	if !hasKey {
		return nil, fmt.Errorf("google public key not found")
	}

	return key, nil
}

func (v *googleTokenVerifier) refreshKeys(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, v.certsURL, nil)
	if err != nil {
		return err
	}

	resp, err := v.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("google jwks request failed with status %d", resp.StatusCode)
	}

	var jwks googleJWKSet
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&jwks); err != nil {
		return err
	}

	keys := make(map[string]*rsa.PublicKey, len(jwks.Keys))
	for _, jwk := range jwks.Keys {
		if jwk.Kid == "" || jwk.Kty != "RSA" || jwk.Alg != "RS256" || jwk.Use != "sig" {
			continue
		}

		key, err := rsaPublicKeyFromJWK(jwk)
		if err != nil {
			continue
		}
		keys[jwk.Kid] = key
	}
	if len(keys) == 0 {
		return fmt.Errorf("google jwks response did not include usable keys")
	}

	expiresAt := time.Now().UTC().Add(cacheMaxAge(resp.Header.Get("Cache-Control"), time.Hour))

	v.mu.Lock()
	v.keys = keys
	v.expiresAt = expiresAt
	v.mu.Unlock()

	return nil
}

func rsaPublicKeyFromJWK(jwk googleJWK) (*rsa.PublicKey, error) {
	modulusBytes, err := base64.RawURLEncoding.DecodeString(jwk.N)
	if err != nil {
		return nil, err
	}
	exponentBytes, err := base64.RawURLEncoding.DecodeString(jwk.E)
	if err != nil {
		return nil, err
	}

	exponent := 0
	for _, b := range exponentBytes {
		exponent = exponent<<8 + int(b)
	}
	if exponent == 0 {
		return nil, fmt.Errorf("invalid rsa exponent")
	}

	return &rsa.PublicKey{
		N: new(big.Int).SetBytes(modulusBytes),
		E: exponent,
	}, nil
}

func cacheMaxAge(header string, fallback time.Duration) time.Duration {
	for _, part := range strings.Split(header, ",") {
		part = strings.TrimSpace(part)
		if !strings.HasPrefix(part, "max-age=") {
			continue
		}

		seconds, err := strconv.Atoi(strings.TrimPrefix(part, "max-age="))
		if err != nil || seconds <= 0 {
			return fallback
		}

		return time.Duration(seconds) * time.Second
	}

	return fallback
}
