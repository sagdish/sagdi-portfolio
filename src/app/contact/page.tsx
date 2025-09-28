import type { Metadata } from "next"
import { ContactForm } from "@/components/forms/contact-form"

export const metadata: Metadata = {
  title: "Contact | Sagdi Formanov",
  description: "Contact Sagdi Formanov.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-3 text-foreground/80">
        Get in touch via email or social links.
      </p>
      <ContactForm />
    </div>
  )
}
