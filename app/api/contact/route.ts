import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Strip control characters (including newlines) to prevent email header injection
function sanitizeHeader(str: string): string {
  return str.replace(/[\r\n\t]/g, ' ').trim()
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    )
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
  }

  if (message.length > 5000) {
    return NextResponse.json({ message: 'Message too long (max 5000 characters)' }, { status: 400 })
  }

  const safeName = sanitizeHeader(name)
  const safeEmail = sanitizeHeader(email)
  const safeMessage = escapeHtml(message)
  const safeName_html = escapeHtml(safeName)
  const safeEmail_html = escapeHtml(safeEmail)

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: `"${safeName}" <${safeEmail}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `New contact form message from ${safeName}`,
      text: `${message}\n\nFrom: ${safeName} (${safeEmail})`,
      html: `<p>${safeMessage}</p><p>From: ${safeName_html} (${safeEmail_html})</p>`,
    })

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Error sending message' },
      { status: 500 }
    )
  }
}
