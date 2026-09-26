import nodemailer from 'nodemailer';

/**
 * Brilliants serverless mailer.
 * Expected Vercel env vars (configure in Vercel project):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
 * If SMTP_HOST is unset, the endpoint returns a graceful no-op so the
 * rest of the site keeps working while credentials are pending.
 *
 * Request body (JSON): { to, toName, subject, text, html }
 */
export default async function mailHandler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  const host = process.env.SMTP_HOST;
  if (!host) {
    res.status(200).json({ ok: true, disabled: true, skipped: true });
    return;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = /^465$/.test(String(port));
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'Brilliants <no-reply@brilliants.in>';

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch (e) {
    body = {};
  }

  const to = (body.to || '').trim();
  const subject = (body.subject || 'Brilliants notification').slice(0, 200);
  const text = body.text || subject;
  const html = body.html || '';

  if (!to) {
    res.status(400).json({ ok: false, error: 'missing recipient' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });

    const info = await transporter.sendMail({
      from,
      to: body.toName ? { name: String(body.toName).slice(0, 100), address: to } : to,
      subject,
      text,
      html: html || undefined
    });

    res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    res.status(502).json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}