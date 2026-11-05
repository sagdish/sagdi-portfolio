import { NextResponse } from "next/server"
import { CONTACT_LIMITS } from "@/lib/contact-limits"

// Subscribe, first step: saves the address as a Resend contact so the list
// exists when sending is built (plan in PREPRODUCTION.md, section D). Nothing
// is emailed yet. The band shows its confirmation line whatever happens here,
// so failures only go to the server log.
// Spam floods are stopped before this route by the Vercel Firewall rate-limit
// rule on POST /api/ (10 per 10 minutes per IP).
// Optional RESEND_SEGMENT_ID: the segment new contacts join (Resend dashboard,
// Contacts → Segments). Without it they're saved to Contacts only.
const reply = (status: number, ok: boolean) =>
  NextResponse.json({ ok }, { status })

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<
      string,
      unknown
    > | null
    if (!body) return reply(400, false)

    // Honeypot: bots fill the hidden "website" field; pretend success.
    const website = typeof body.website === "string" ? body.website.trim() : ""
    if (website) return reply(200, true)

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    if (
      !email ||
      email.length > CONTACT_LIMITS.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return reply(400, false)
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (!RESEND_API_KEY) {
      console.error("[subscribe] not configured, missing: RESEND_API_KEY")
      return reply(500, false)
    }
    const segment = process.env.RESEND_SEGMENT_ID

    const resp = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
        ...(segment ? { segments: [{ id: segment }] } : {}),
      }),
      cache: "no-store",
    })

    if (!resp.ok) {
      // A repeat signup may come back as an error; the address is already
      // saved then, so the log is enough.
      console.error(
        `[subscribe] Resend refused (${resp.status}): ${await resp.text()}`
      )
      return reply(502, false)
    }

    return reply(200, true)
  } catch (err) {
    console.error("[subscribe] unexpected error", err)
    return reply(500, false)
  }
}
