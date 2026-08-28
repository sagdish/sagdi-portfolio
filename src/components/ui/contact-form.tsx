"use client"

import { useState, type FormEvent } from "react"
import { cn } from "@/lib/utils"

export type ContactFormLabels = {
  name: string
  email: string
  message: string
  send: string
  sending: string
  sent: string
  /** fallback when the server sends no error of its own */
  error: string
}

type Status = "idle" | "submitting" | "success" | "error"

/**
 * Contact form for the Work page. POSTs to /api/contact (Resend) and, like the
 * Subscribe band, swaps itself for a confirmation line once sent. `website` is the
 * honeypot the route already checks: bots fill it, the route fakes success.
 *
 * Presentational only, i18n-free: every string arrives as a prop, so it can sit on
 * any page over any locale.
 */
export function ContactForm({
  labels,
  id,
  className,
}: {
  labels: ContactFormLabels
  id?: string
  className?: string
}) {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Read the fields before the re-render disables them: a disabled input is
    // dropped from FormData.
    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    }

    setStatus("submitting")
    setError(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error || labels.error)
      }
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : labels.error)
    }
  }

  const submitting = status === "submitting"

  return (
    <div id={id} className={cn("cform", className)}>
      {status !== "success" && (
        <form className="cform-fields" onSubmit={onSubmit}>
          <div className="cform-row">
            <div className="cfield">
              <label htmlFor="cf-name">{labels.name}</label>
              <input
                id="cf-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={submitting}
              />
            </div>
            <div className="cfield">
              <label htmlFor="cf-email">{labels.email}</label>
              <input
                id="cf-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="cfield">
            <label htmlFor="cf-message">{labels.message}</label>
            <textarea
              id="cf-message"
              name="message"
              rows={6}
              required
              disabled={submitting}
            />
          </div>

          {/* Honeypot: off-screen rather than display:none, which bots skip. */}
          <input
            className="cform-hp"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="cform-foot">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? labels.sending : labels.send}{" "}
              <span className="arw">→</span>
            </button>
          </div>
        </form>
      )}

      <div className="cform-status" aria-live="polite">
        {status === "success" && <span className="ok">{labels.sent}</span>}
        {status === "error" && <span className="err">{error}</span>}
      </div>
    </div>
  )
}
