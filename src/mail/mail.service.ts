import { Injectable } from '@nestjs/common'
import { BrevoClient, BrevoEnvironment } from '@getbrevo/brevo'

@Injectable()
export class MailService {
  private client: BrevoClient

  constructor() {
    this.client = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY || '',
      environment: BrevoEnvironment.Default,
    })
  }

  /**
   * Sends enquiry notification via Brevo. Does not throw — callers should not rely on exceptions.
   * Requires BREVO_API_KEY, and a non-empty sender + recipient (see env resolution below).
   */
  async sendContactEmail(data: {
    name: string
    email: string
    phone?: string
    subject?: string
    message: string
  }): Promise<void> {
    const { name, email, phone, subject, message } = data

    const apiKey = (process.env.BREVO_API_KEY || '').trim()
    /** Must be a sender verified in Brevo (often your team inbox). */
    const senderEmail =
      (process.env.BREVO_SENDER_EMAIL || process.env.CONTACT_EMAIL || '').trim()
    /** Where notifications are delivered; defaults to CONTACT_EMAIL if unset. */
    const recipientEmail =
      (process.env.MAIL_TO_EMAIL || process.env.CONTACT_EMAIL || '').trim()

    if (!apiKey) {
      console.warn(
        '[MailService] Skipping send: BREVO_API_KEY is not set.',
      )
      return
    }
    if (!senderEmail) {
      console.warn(
        '[MailService] Skipping send: sender email missing. Set BREVO_SENDER_EMAIL or CONTACT_EMAIL (verified sender in Brevo).',
      )
      return
    }
    if (!recipientEmail) {
      console.warn(
        '[MailService] Skipping send: recipient missing. Set CONTACT_EMAIL or MAIL_TO_EMAIL.',
      )
      return
    }

    try {
      await this.client.transactionalEmails.sendTransacEmail({
        sender: {
          name: 'TDM Infra Website',
          email: senderEmail,
        },
        to: [{ email: recipientEmail, name: 'TDM Infra' }],
        replyTo: { email, name },
        subject: subject || 'New Enquiry from Website',
        htmlContent: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 28px 24px;">
    <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.80); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">New Enquiry</p>
    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">TDM Infra Rental</h1>
  </div>

  <!-- BODY -->
  <div style="padding: 24px 20px; background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);">

    <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
      You have received a new enquiry from your website. Details are below.
    </p>

    <!-- DETAILS CARD -->
    <div style="background: #ffffff; border: 1.5px solid #dbeafe; border-radius: 12px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(37,99,235,0.06);">

      <!-- Name -->
      <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 3px 0; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">Name</p>
        <p style="margin: 0; color: #0f172a; font-size: 15px; font-weight: 700;">${name}</p>
      </div>

      <!-- Email -->
      <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 3px 0; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">Email</p>
        <p style="margin: 0;">
          <a href="mailto:${email}" style="color: #2563eb; font-size: 15px; text-decoration: none; word-break: break-all;">${email}</a>
        </p>
      </div>

      <!-- Phone -->
      <div style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
        <p style="margin: 0 0 3px 0; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">Phone</p>
        <p style="margin: 0;">
          <a href="tel:${phone}" style="color: #2563eb; font-size: 15px; text-decoration: none;">${phone || '—'}</a>
        </p>
      </div>

      <!-- Subject -->
      <div style="padding: 12px 16px;">
        <p style="margin: 0 0 3px 0; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">Subject</p>
        <p style="margin: 0; color: #0f172a; font-size: 15px;">${subject || '—'}</p>
      </div>

    </div>

    <!-- MESSAGE BOX -->
    <div style="background: #eff6ff; border: 1.5px solid #dbeafe; border-radius: 12px; padding: 16px;">
      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Message</p>
      <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 1.7;">${message}</p>
    </div>

    <!-- REPLY CTA -->
    <div style="margin-top: 24px; text-align: center;">
      <a href="mailto:${email}"
        style="display: inline-block; width: 100%; max-width: 280px; padding: 14px 24px; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 999px; box-shadow: 0 6px 20px rgba(37,99,235,0.30); text-align: center;">
        Reply to ${name}
      </a>
    </div>

  </div>

  <!-- FOOTER -->
  <div style="background: #f0f7ff; padding: 16px 20px; text-align: center; border-top: 1px solid #dbeafe;">
    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
      This email was sent automatically from your website contact form.<br/>
      <strong style="color: #0f172a;">TDM Infra Rental</strong> · tdminfra.com
    </p>
  </div>

</div>
        `,
      })
    } catch (err) {
      console.error('[MailService] Brevo send failed (enquiry may still be saved):', err)
    }
  }
}