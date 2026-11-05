// Longest accepted value per contact form field. The form sets these as
// maxLength and /api/contact rejects anything longer, so both stay in step.
// 254 is the longest valid email address.
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const
