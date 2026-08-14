import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Github, Instagram, Linkedin } from "lucide-react"

const navigation = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "projects", href: "/projects" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
] as const

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/sagdi-formanov",
    icon: Linkedin,
  },
  {
    name: "GitHub",
    href: "https://github.com/sagdish",
    icon: Github,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/forsi_ph",
    icon: Instagram,
  },
]

export function Footer() {
  const t = useTranslations()
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("footer.navHeading")}
            </h3>
            <ul className="mt-4 space-y-2">
              {navigation.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("footer.connect")}
            </h3>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white"></h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {t("footer.bio")}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} {t("common.fullName")}.{" "}
            {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
