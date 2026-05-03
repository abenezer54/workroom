package services

import (
	"fmt"
	"log"

	"github.com/resend/resend-go/v2"
)

type MailService interface {
	SendVerificationEmail(toEmail, verificationLink string) error
}

type resendMailService struct {
	client    *resend.Client
	fromEmail string
}

func NewMailService(apiKey, fromEmail string) MailService {
	if apiKey == "" {
		log.Println("WARNING: RESEND_API_KEY is not set. Email delivery will be mocked.")
		return &mockMailService{fromEmail: fromEmail}
	}
	client := resend.NewClient(apiKey)
	return &resendMailService{
		client:    client,
		fromEmail: fromEmail,
	}
}

func (s *resendMailService) SendVerificationEmail(toEmail, verificationLink string) error {
	params := &resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: "Verify your Workroom account",
		Html: fmt.Sprintf(`
			<h2>Welcome to Workroom!</h2>
			<p>Please verify your email address by clicking the link below:</p>
			<p><a href="%s" style="display:inline-block;padding:10px 20px;background-color:#000;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a></p>
			<p>If the button doesn't work, copy and paste this URL into your browser:</p>
			<p>%s</p>
		`, verificationLink, verificationLink),
	}

	_, err := s.client.Emails.Send(params)
	if err != nil {
		log.Printf("ERROR: Failed to send email via Resend to %s. Reason: %v\n", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

type mockMailService struct {
	fromEmail string
}

func (m *mockMailService) SendVerificationEmail(toEmail, verificationLink string) error {
	log.Println("--------------------------------------------------")
	log.Printf("MOCK EMAIL SENT TO: %s\n", toEmail)
	log.Printf("SUBJECT: Verify your Workroom account\n")
	log.Printf("LINK: %s\n", verificationLink)
	log.Println("--------------------------------------------------")
	return nil
}
