export interface SendEmailPayload {
  attachments: string[];
  subject: string;
  html: string;
  bcc: string;
  leads: string[];
}
