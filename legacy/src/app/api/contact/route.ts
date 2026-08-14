import { NextResponse } from "next/server"

type ContactBody = {
  name?: string
  email?: string
  message?: string
  website?: string // honeypot
}

export async function POST(req: Request) {
  try {
    const { name, email, message, website }: ContactBody = await req.json()

    // Simple honeypot: if filled, pretend success
    if (website && website.trim().length > 0) {
      return NextResponse.json({ ok: true })
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email" },
        { status: 400 }
      )
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL
    const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL

    const missing: string[] = []
    if (!RESEND_API_KEY) missing.push("RESEND_API_KEY")
    if (!CONTACT_TO_EMAIL) missing.push("CONTACT_TO_EMAIL")
    if (!CONTACT_FROM_EMAIL) missing.push("CONTACT_FROM_EMAIL")
    if (missing.length) {
      return NextResponse.json(
        {
          ok: false,
          error: `Server not configured: missing ${missing.join(", ")}`,
        },
        { status: 500 }
      )
    }

    const subject = `New message from ${name}`
    const html = `
      <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 8px 0">Portfolio Contact</h2>
        <p style="margin:0 0 8px 0"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 8px 0"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:12px 0 0 0;white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        subject,
        html,
        reply_to: email,
      }),
      // Avoid caching
      cache: "no-store",
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json(
        { ok: false, error: `Email send failed: ${text}` },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 }
    )
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
