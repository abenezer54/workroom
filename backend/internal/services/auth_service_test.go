package services

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	apperrors "workroom/backend/internal/errors"
	"workroom/backend/internal/models"
)

func TestGoogleSignUpCreatesAgencyAdmin(t *testing.T) {
	repo := newFakeUserRepository()
	verifier := &fakeGoogleVerifier{
		identity: &GoogleIdentity{
			Subject:       "google-subject-1",
			Email:         "owner@example.com",
			Name:          "Abeni Studio",
			EmailVerified: true,
		},
	}
	service := NewAuthService(repo, NewJWTService("test-secret", time.Hour), verifier, &fakeMailService{}, "google-client-id", "http://localhost:3000")

	result, err := service.GoogleSignIn(context.Background(), dto.GoogleAuthRequest{
		Credential: "google-credential",
		Mode:       "register",
	})
	if err != nil {
		t.Fatalf("GoogleSignIn returned error: %v", err)
	}

	if result.AccessToken == "" {
		t.Fatal("expected access token")
	}
	if result.User.Role != models.RoleAgencyAdmin {
		t.Fatalf("expected agency admin role, got %s", result.User.Role)
	}
	if result.User.AgencyID == nil || *result.User.AgencyID != result.User.ID {
		t.Fatal("expected new Google signup to own its agency scope")
	}
	if verifier.audience != "google-client-id" {
		t.Fatalf("expected verifier audience to use configured client id, got %q", verifier.audience)
	}

	user := repo.usersByID[result.User.ID]
	if user == nil {
		t.Fatal("expected created user in repository")
	}
	if user.PasswordHash != "" {
		t.Fatal("expected Google-created user to have no password hash")
	}
	if user.GoogleSubject == nil || *user.GoogleSubject != "google-subject-1" {
		t.Fatal("expected Google subject to be stored")
	}
}

func TestGoogleLoginLinksExistingEmailAccount(t *testing.T) {
	agencyID := uuid.New()
	existing := &models.User{
		ID:           uuid.New(),
		AgencyID:     &agencyID,
		Name:         "Existing Owner",
		Email:        "owner@example.com",
		PasswordHash: "hashed-password",
		Role:         models.RoleAgencyAdmin,
		IsActive:     true,
	}
	repo := newFakeUserRepository(existing)
	service := NewAuthService(
		repo,
		NewJWTService("test-secret", time.Hour),
		&fakeGoogleVerifier{
			identity: &GoogleIdentity{
				Subject:       "google-subject-2",
				Email:         "owner@example.com",
				Name:          "Existing Owner",
				EmailVerified: true,
			},
		},
		&fakeMailService{},
		"google-client-id",
		"http://localhost:3000",
	)

	result, err := service.GoogleSignIn(context.Background(), dto.GoogleAuthRequest{
		Credential: "google-credential",
		Mode:       "login",
	})
	if err != nil {
		t.Fatalf("GoogleSignIn returned error: %v", err)
	}

	if result.User.ID != existing.ID {
		t.Fatalf("expected existing user id %s, got %s", existing.ID, result.User.ID)
	}
	if existing.GoogleSubject == nil || *existing.GoogleSubject != "google-subject-2" {
		t.Fatal("expected existing email account to be linked to Google subject")
	}
	if existing.LastLoginAt == nil {
		t.Fatal("expected last login timestamp to be updated")
	}
}

func TestGoogleLoginDoesNotCreateUnknownAccount(t *testing.T) {
	repo := newFakeUserRepository()
	service := NewAuthService(
		repo,
		NewJWTService("test-secret", time.Hour),
		&fakeGoogleVerifier{
			identity: &GoogleIdentity{
				Subject:       "google-subject-3",
				Email:         "unknown@example.com",
				Name:          "Unknown Owner",
				EmailVerified: true,
			},
		},
		&fakeMailService{},
		"google-client-id",
		"http://localhost:3000",
	)

	_, err := service.GoogleSignIn(context.Background(), dto.GoogleAuthRequest{
		Credential: "google-credential",
		Mode:       "login",
	})
	assertAppErrorStatus(t, err, http.StatusUnauthorized)

	if len(repo.usersByID) != 0 {
		t.Fatal("expected Google login not to create a new account")
	}
}

func TestGoogleRegisterRejectsExistingEmailAccount(t *testing.T) {
	existing := &models.User{
		ID:           uuid.New(),
		Name:         "Existing Owner",
		Email:        "owner@example.com",
		PasswordHash: "hashed-password",
		Role:         models.RoleAgencyAdmin,
		IsActive:     true,
	}
	repo := newFakeUserRepository(existing)
	service := NewAuthService(
		repo,
		NewJWTService("test-secret", time.Hour),
		&fakeGoogleVerifier{
			identity: &GoogleIdentity{
				Subject:       "google-subject-4",
				Email:         "owner@example.com",
				Name:          "Existing Owner",
				EmailVerified: true,
			},
		},
		&fakeMailService{},
		"google-client-id",
		"http://localhost:3000",
	)

	_, err := service.GoogleSignIn(context.Background(), dto.GoogleAuthRequest{
		Credential: "google-credential",
		Mode:       "register",
	})
	assertAppErrorStatus(t, err, http.StatusConflict)

	if existing.GoogleSubject != nil {
		t.Fatal("expected register flow not to link an existing account")
	}
}

func TestGoogleSignInRejectsUnverifiedEmail(t *testing.T) {
	service := NewAuthService(
		newFakeUserRepository(),
		NewJWTService("test-secret", time.Hour),
		&fakeGoogleVerifier{
			identity: &GoogleIdentity{
				Subject:       "google-subject-5",
				Email:         "owner@example.com",
				Name:          "Owner",
				EmailVerified: false,
			},
		},
		&fakeMailService{},
		"google-client-id",
		"http://localhost:3000",
	)

	_, err := service.GoogleSignIn(context.Background(), dto.GoogleAuthRequest{
		Credential: "google-credential",
		Mode:       "register",
	})
	assertAppErrorStatus(t, err, http.StatusUnauthorized)
}

func TestGoogleSignInRejectsMismatchedGoogleSubject(t *testing.T) {
	existing := &models.User{
		ID:            uuid.New(),
		Name:          "Existing Owner",
		Email:         "owner@example.com",
		PasswordHash:  "hashed-password",
		GoogleSubject: stringPtr("different-google-subject"),
		Role:          models.RoleAgencyAdmin,
		IsActive:      true,
	}
	service := NewAuthService(
		newFakeUserRepository(existing),
		NewJWTService("test-secret", time.Hour),
		&fakeGoogleVerifier{
			identity: &GoogleIdentity{
				Subject:       "google-subject-6",
				Email:         "owner@example.com",
				Name:          "Owner",
				EmailVerified: true,
			},
		},
		&fakeMailService{},
		"google-client-id",
		"http://localhost:3000",
	)

	_, err := service.GoogleSignIn(context.Background(), dto.GoogleAuthRequest{
		Credential: "google-credential",
		Mode:       "login",
	})
	assertAppErrorStatus(t, err, http.StatusConflict)
}

type fakeGoogleVerifier struct {
	identity   *GoogleIdentity
	err        error
	credential string
	audience   string
}

type fakeMailService struct{}

func (s *fakeMailService) SendVerificationEmail(toEmail, verificationLink string) error {
	return nil
}

func (v *fakeGoogleVerifier) Verify(ctx context.Context, credential string, audience string) (*GoogleIdentity, error) {
	v.credential = credential
	v.audience = audience
	if v.err != nil {
		return nil, v.err
	}
	if v.identity == nil {
		return nil, errors.New("missing fake Google identity")
	}

	return v.identity, nil
}

type fakeUserRepository struct {
	usersByID            map[uuid.UUID]*models.User
	usersByEmail         map[string]*models.User
	usersByGoogleSubject map[string]*models.User
}

func newFakeUserRepository(users ...*models.User) *fakeUserRepository {
	repo := &fakeUserRepository{
		usersByID:            map[uuid.UUID]*models.User{},
		usersByEmail:         map[string]*models.User{},
		usersByGoogleSubject: map[string]*models.User{},
	}
	for _, user := range users {
		repo.store(user)
	}

	return repo
}

func (r *fakeUserRepository) Create(user *models.User) error {
	if user.ID == uuid.Nil {
		user.ID = uuid.New()
	}
	now := time.Now().UTC()
	if user.CreatedAt.IsZero() {
		user.CreatedAt = now
	}
	if user.UpdatedAt.IsZero() {
		user.UpdatedAt = now
	}

	r.store(user)
	return nil
}

func (r *fakeUserRepository) FindByID(id uuid.UUID) (*models.User, error) {
	return r.usersByID[id], nil
}

func (r *fakeUserRepository) FindByEmail(email string) (*models.User, error) {
	return r.usersByEmail[normalizeTestEmail(email)], nil
}

func (r *fakeUserRepository) FindByGoogleSubject(subject string) (*models.User, error) {
	return r.usersByGoogleSubject[strings.TrimSpace(subject)], nil
}

func (r *fakeUserRepository) EmailExists(email string) (bool, error) {
	_, exists := r.usersByEmail[normalizeTestEmail(email)]
	return exists, nil
}

func (r *fakeUserRepository) UpdateAgencyID(userID uuid.UUID, agencyID uuid.UUID) error {
	user := r.usersByID[userID]
	if user == nil {
		return nil
	}
	user.AgencyID = &agencyID
	return nil
}

func (r *fakeUserRepository) UpdateGoogleSubject(userID uuid.UUID, subject string) error {
	user := r.usersByID[userID]
	if user == nil {
		return nil
	}
	subject = strings.TrimSpace(subject)
	user.GoogleSubject = &subject
	r.usersByGoogleSubject[subject] = user
	return nil
}

func (r *fakeUserRepository) UpdateLastLoginAt(userID uuid.UUID, loggedInAt time.Time) error {
	user := r.usersByID[userID]
	if user == nil {
		return nil
	}
	user.LastLoginAt = &loggedInAt
	return nil
}

func (r *fakeUserRepository) UpdateEmailVerified(userID uuid.UUID) error {
	user := r.usersByID[userID]
	if user == nil {
		return nil
	}
	user.IsEmailVerified = true
	return nil
}

func (r *fakeUserRepository) store(user *models.User) {
	r.usersByID[user.ID] = user
	r.usersByEmail[normalizeTestEmail(user.Email)] = user
	if user.GoogleSubject != nil {
		r.usersByGoogleSubject[strings.TrimSpace(*user.GoogleSubject)] = user
	}
}

func assertAppErrorStatus(t *testing.T, err error, status int) {
	t.Helper()

	var appErr apperrors.AppError
	if !errors.As(err, &appErr) {
		t.Fatalf("expected AppError, got %T: %v", err, err)
	}
	if appErr.Status != status {
		t.Fatalf("expected status %d, got %d", status, appErr.Status)
	}
}

func normalizeTestEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func stringPtr(value string) *string {
	return &value
}
