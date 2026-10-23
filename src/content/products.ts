import type { Locale } from "@/i18n/routing"

export type ProductStatus = "live" | "progress" | "parked" | "pre-start"

/** A localized string. `en` is required; ru/uz fall back to `en` until translated. */
type Localized = Partial<Record<Locale, string>> & { en: string }

export type Product = {
  slug: string
  status: ProductStatus
  /** external product site; the detail page renders it as a Visit CTA */
  url?: string
  /** source repository; the detail page renders it as a GitHub link */
  github?: string
  title: string
  tagline: Localized
  /** "What it is" on the detail page */
  body: Localized
  /** optional detail-page sections; each renders only when present */
  who?: Localized
  how?: Localized[]
  now?: Localized
  /** copy still to be replaced with Sagdi's real words (renders a "sample" marker) */
  placeholder?: boolean
}

// Pulled from the OS product board (PRODUCTS/*/overview.md). Statuses echo the board.
// EN populated; ru/uz fall back to EN until finalized (see loc()).
export const PRODUCTS: Product[] = [
  {
    slug: "reguself",
    status: "live",
    url: "https://reguself.com",
    title: "ReguSelf",
    tagline: {
      en: "Regulate yourself: a tool for staying on track.",
      ru: "Регулируй себя: инструмент, чтобы держаться курса.",
      uz: "Oʻzingni boshqar: yoʻldan chalgʻimaslik uchun vosita.",
    },
    body: {
      en: "ReguSelf is live and moving: a tool for regulating your own attention and habits, built in public.",
      ru: "ReguSelf уже работает и развивается: инструмент для управления своим вниманием и привычками, который я делаю у всех на виду.",
      uz: "ReguSelf allaqachon ishlayapti va rivojlanyapti: oʻz eʼtibor va odatlaringizni boshqarish uchun vosita, ochiq qurilyapti.",
    },
  },
  {
    slug: "pm-guide",
    status: "live",
    url: "https://pm-guide.vercel.app/",
    title: "The Ultimate Guide to Product Management",
    tagline: {
      en: "A comprehensive, practical resource for aspiring and experienced product managers.",
      ru: "Полный практический ресурс для начинающих и опытных продакт-менеджеров.",
      uz: "Boshlovchi va tajribali product-menejerlar uchun toʻliq, amaliy manba.",
    },
    body: {
      en: "Covers core PM concepts, frameworks, and real-world applications to help you excel in product management roles.",
      ru: "Разбирает ключевые концепции, фреймворки и реальные примеры, чтобы помочь вырасти в продакт-менеджменте.",
      uz: "Product-menejmentda oʻsishingiz uchun asosiy tushunchalar, freymvorklar va real misollarni qamrab oladi.",
    },
  },
  {
    slug: "personal-os",
    status: "live",
    github: "https://github.com/sagdish/personal_OS-",
    title: "Personal OS",
    tagline: {
      en: "Your life as plain text files, read by an AI once a day.",
      ru: "Твоя жизнь в виде простых текстовых файлов, которые раз в день читает ИИ.",
      uz: "Hayotingiz oddiy matn fayllari koʻrinishida, kuniga bir marta AI oʻqiydi.",
    },
    body: {
      en: "Your life as plain text files on your own computer. Once a day an AI reads them and tells you where you stand across the areas of your life, in your own words, with no score and no nagging. A ten-minute setup builds it around you: your areas, your voice, your rhythm. It is not a task manager or a habit app with streaks.",
      ru: "Твоя жизнь в виде простых текстовых файлов на твоём компьютере. Раз в день ИИ читает их и говорит, как у тебя дела по разным сферам жизни, твоими же словами, без оценок и нытья. Настройка за десять минут выстраивает всё под тебя: твои сферы, твой голос, твой ритм. Это не таск-менеджер и не трекер привычек со стриками.",
      uz: "Hayotingiz oʻz kompyuteringizdagi oddiy matn fayllarida. Kuniga bir marta AI ularni oʻqiydi va hayotingizning turli sohalarida qayerda turganingizni oʻz soʻzlaringiz bilan, bahosiz va dakki-dashnomsiz aytib beradi. Oʻn daqiqalik sozlash hammasini sizga moslab quradi: sohalaringiz, ohangingiz, ritmingiz. Bu task-menejer yoki striklik odat ilovasi emas.",
    },
    who: {
      en: "Anyone who wants to keep several parts of their life in view without a task manager or streaks. No coding needed: you type a few commands and the AI does the rest.",
      ru: "Для всех, кто хочет держать несколько сфер жизни в поле зрения без таск-менеджеров и стриков. Код не нужен: вводишь пару команд, остальное делает ИИ.",
      uz: "Hayotining bir nechta sohasini task-menejer yoki striklarsiz nazoratda tutmoqchi boʻlgan har kim uchun. Kod yozish shart emas: bir nechta buyruq kiritasiz, qolganini AI qiladi.",
    },
    how: [
      {
        en: "Install it with one command, then answer a short setup interview inside Claude Code: your areas, your voice, your rhythm.",
        ru: "Ставишь одной командой, потом отвечаешь на короткое интервью-настройку прямо в Claude Code: твои сферы, твой голос, твой ритм.",
        uz: "Bitta buyruq bilan oʻrnatasiz, soʻng Claude Code ichida qisqa sozlash-suhbatiga javob berasiz: sohalaringiz, ohangingiz, ritmingiz.",
      },
      {
        en: "Write anything, anywhere in your journal: on the page, inside Claude, or on your phone through Obsidian.",
        ru: "Пишешь что угодно и где угодно в своём дневнике: на странице, внутри Claude или с телефона через Obsidian.",
        uz: "Kundaligingizga istagan narsani, istagan joyda yozasiz: sahifada, Claude ichida yoki telefonda Obsidian orqali.",
      },
      {
        en: "Once a day the read arrives: where you stand, one line per area, what moved, and at most one question.",
        ru: "Раз в день приходит сводка: где ты находишься, по строчке на каждую сферу, что сдвинулось и максимум один вопрос.",
        uz: "Kuniga bir marta xulosa keladi: qayerdasiz, har soha uchun bir qator, nima oʻzgardi va koʻpi bilan bitta savol.",
      },
      {
        en: "Everything stays on your computer as plain text files. Only the daily read goes to your AI provider.",
        ru: "Всё остаётся на твоём компьютере в виде текстовых файлов. К ИИ-провайдеру уходит только ежедневная сводка.",
        uz: "Hammasi kompyuteringizda matn fayllari sifatida qoladi. AI-provayderga faqat kunlik xulosa joʻnatiladi.",
      },
    ],
    now: {
      en: "Ready to install from GitHub: one command on Mac and Linux, step by step on Windows. It needs a Claude Pro or Max subscription.",
      ru: "Готов к установке с GitHub: одной командой на Mac и Linux, пошагово на Windows. Нужна подписка Claude Pro или Max.",
      uz: "GitHubdan oʻrnatishga tayyor: Mac va Linuxda bitta buyruq, Windowsda bosqichma-bosqich. Claude Pro yoki Max obunasi kerak.",
    },
  },
  {
    slug: "pomodoro-focus-dock",
    status: "pre-start",
    title: "Pomodoro Focus Dock",
    tagline: {
      en: "A focus timer that lives on the dock.",
      ru: "Таймер фокуса, который живёт в доке.",
      uz: "Dokda yashaydigan fokus taymeri.",
    },
    body: {
      en: "A small, always-there focus timer that sits on the dock and keeps a session honest.",
      ru: "Небольшой таймер фокуса: всегда под рукой в доке и держит сессию честной.",
      uz: "Dokda doim koʻz oldingizda turadigan, sessiyani halol saqlaydigan kichik fokus taymeri.",
    },
  },
  {
    slug: "screenshots-processor",
    status: "progress",
    title: "Screenshots Processor",
    tagline: {
      en: "Turns a pile of screenshots into something useful.",
      ru: "Превращает кучу скриншотов во что-то полезное.",
      uz: "Bir toʻda skrinshotni foydali narsaga aylantiradi.",
    },
    body: {
      en: "Point it at a folder of screenshots and get back something structured and searchable.",
      ru: "Указываешь ему папку со скриншотами и получаешь что-то структурированное и с поиском.",
      uz: "Unga skrinshotlar jildini koʻrsatasiz va tuzilgan, qidiriladigan natija olasiz.",
    },
  },
  {
    slug: "finkeep",
    status: "progress",
    title: "finKeep",
    tagline: {
      en: "A booking tool for psychologists and personal coaches.",
      ru: "Инструмент для записи клиентов для психологов и персональных коучей.",
      uz: "Psixolog va shaxsiy kouchlar uchun mijozlarni yozib olish vositasi.",
    },
    body: {
      en: "A booking tool for psychologists and personal coaches.",
      ru: "Инструмент для записи клиентов для психологов и персональных коучей.",
      uz: "Psixolog va shaxsiy kouchlar uchun mijozlarni yozib olish vositasi.",
    },
  },
]

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug)

export const loc = (value: Localized, locale: Locale) =>
  value[locale] ?? value.en
