import { NextResponse } from "next/server"
import { CONTACT_LIMITS } from "@/lib/contact-limits"

// Visitors only ever get a short code back; the form shows its own translated
// text. Details (missing settings, Resend's reply) go to the server log only.
// Spam floods are stopped before this route by the Vercel Firewall rate-limit
// rule on POST /api/contact (10 per 10 minutes per IP, see PREPRODUCTION.md).
const fail = (status: number, error: string) =>
  NextResponse.json({ ok: false, error }, { status })

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "")

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<
      string,
      unknown
    > | null
    if (!body) return fail(400, "invalid")

    // Honeypot: bots fill the hidden "website" field; pretend success.
    if (text(body.website)) return NextResponse.json({ ok: true })

    const name = text(body.name)
    const email = text(body.email)
    const message = text(body.message)

    if (!name || !email || !message) return fail(400, "invalid")
    if (
      name.length > CONTACT_LIMITS.name ||
      email.length > CONTACT_LIMITS.email ||
      message.length > CONTACT_LIMITS.message
    ) {
      return fail(400, "invalid")
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, "invalid")

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL
    const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL

    const missing = [
      !RESEND_API_KEY && "RESEND_API_KEY",
      !CONTACT_TO_EMAIL && "CONTACT_TO_EMAIL",
      !CONTACT_FROM_EMAIL && "CONTACT_FROM_EMAIL",
    ].filter(Boolean)
    if (missing.length) {
      console.error(`[contact] not configured, missing: ${missing.join(", ")}`)
      return fail(500, "unavailable")
    }

    // One line for the subject: no line breaks from the name field.
    const subject = `sagdi.com: New message from ${name.replace(/\s+/g, " ")}`
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#111">
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
      console.error(
        `[contact] Resend refused (${resp.status}): ${await resp.text()}`
      )
      return fail(502, "send_failed")
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[contact] unexpected error", err)
    return fail(500, "unexpected")
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
