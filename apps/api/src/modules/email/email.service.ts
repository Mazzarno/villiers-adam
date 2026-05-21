import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailjet from 'node-mailjet';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client?: ReturnType<typeof Mailjet.apiConnect>;
  private readonly senderEmail?: string;
  private readonly senderName?: string;
  private readonly contactRecipient?: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('MAILJET_API_KEY');
    const secretKey = config.get<string>('MAILJET_SECRET_KEY');

    if (apiKey && secretKey) {
      this.client = Mailjet.apiConnect(apiKey, secretKey);
      this.senderEmail = config.get<string>('MAILJET_SENDER_EMAIL');
      this.senderName = config.get<string>('MAILJET_SENDER_NAME') ?? 'Mairie';
    }

    this.contactRecipient =
      config.get<string>('CONTACT_FORM_RECIPIENT') ?? config.get<string>('MAILJET_SENDER_EMAIL');
  }

  async sendPasswordReset(email: string, token: string) {
    return this.sendMail({
      to: email,
      subject: 'Reinitialisation du mot de passe',
      text: `Votre lien de reinitialisation: ${token}`,
      html: `<p>Votre lien de reinitialisation:</p><p><strong>${token}</strong></p>`,
    });
  }

  async sendNewsletterConfirmation(email: string, token: string) {
    return this.sendMail({
      to: email,
      subject: 'Confirmation inscription newsletter',
      text: `Confirmez votre inscription avec ce code: ${token}`,
      html: `<p>Confirmez votre inscription avec ce code:</p><p><strong>${token}</strong></p>`,
    });
  }

  async sendReservationConfirmation(email: string, reservationRef: string) {
    return this.sendMail({
      to: email,
      subject: 'Confirmation de reservation',
      text: `Votre demande de reservation est enregistree. Reference: ${reservationRef}`,
      html: `<p>Votre demande de reservation est enregistree.</p><p><strong>${reservationRef}</strong></p>`,
    });
  }

  async sendEventReminder(email: string, eventTitle: string, eventDate: string) {
    return this.sendMail({
      to: email,
      subject: 'Rappel evenement',
      text: `Rappel: ${eventTitle} le ${eventDate}`,
      html: `<p>Rappel:</p><p><strong>${eventTitle}</strong> le ${eventDate}</p>`,
    });
  }

  async sendFormReceipt(email: string, subject: string) {
    return this.sendMail({
      to: email,
      subject: 'Reception de votre message',
      text: `Votre message a ete recu: ${subject}`,
      html: `<p>Votre message a ete recu:</p><p><strong>${subject}</strong></p>`,
    });
  }

  async sendContactMessage(input: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const recipient = this.contactRecipient ?? this.senderEmail;
    if (!recipient) {
      this.logger.warn('No contact recipient configured. Skipping contact message delivery.');
      return { skipped: true };
    }

    const escapedName = this.escapeHtml(input.name);
    const escapedEmail = this.escapeHtml(input.email);
    const escapedMessage = this.escapeHtml(input.message).replace(/\n/g, '<br />');

    return this.sendMail({
      to: recipient,
      subject: `[Contact site] ${input.subject}`,
      text: `Nom: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
      html: `<p><strong>Nom:</strong> ${escapedName}</p><p><strong>Email:</strong> ${escapedEmail}</p><p><strong>Message:</strong></p><p>${escapedMessage}</p>`,
    });
  }

  private async sendMail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    if (!this.client || !this.senderEmail) {
      this.logger.warn(`Mailjet not configured. Skipping email to ${to}`);
      return { skipped: true };
    }

    const request = this.client.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: this.senderEmail,
            Name: this.senderName ?? 'Mairie',
          },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    });

    return request;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
