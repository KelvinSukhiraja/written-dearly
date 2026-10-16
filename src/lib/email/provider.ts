import "server-only";
import nodemailer from "nodemailer";
export function emailConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.EMAIL_FROM &&
    process.env.APP_URL
  );
}
export async function deliverEmail(
  to: string,
  message: { subject: string; text: string; html: string },
  messageId: string,
) {
  if (!emailConfigured()) throw new Error("Email delivery is not configured.");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    requireTLS: true,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  try {
    const result = await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      ...message,
      messageId,
    });
    if (!result.accepted?.length)
      throw new Error("The mail server did not accept this recipient.");
    return result.messageId as string;
  } finally {
    transport.close();
  }
}
