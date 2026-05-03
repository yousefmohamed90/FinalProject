import nodemailer from "nodemailer";
import { logger } from "../lib/logger.js";

interface SendEmailOptions {
  email: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via SMTP. Falls back to logging the email body when SMTP
 * credentials are not configured (useful in development).
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const host = process.env["SMTP_HOST"];
  const port = process.env["SMTP_PORT"];
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  const from = process.env["FROM_EMAIL"] || "noreply@codesource.dev";
  const fromName = process.env["FROM_NAME"] || "CodeSource Marketplace";

  if (!host || !port || !user || !pass) {
    logger.warn(
      { to: options.email, subject: options.subject },
      "[sendEmail] SMTP not configured — printing email instead",
    );
    logger.info({ html: options.html }, "Email body");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `${fromName} <${from}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}
