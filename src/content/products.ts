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
      ru: "Управляй своим состоянием и вниманием, чтобы не сбиваться с пути.",
      uz: "Oʻzingni boshqar, diqqatingni jamla va tanlagan yoʻlingdan chiqib ketma.",
    },
    body: {
      en: "ReguSelf is live and moving: a tool for regulating your own attention and habits, built in public.",
      ru: "ReguSelf уже работает и продолжает развиваться. Это инструмент, который помогает управлять вниманием и привычками. Я создаю его открыто, делясь процессом.",
      uz: "ReguSelf ishlayapti va rivojlanishda davom etyapti. U diqqat va odatlarni boshqarishga yordam beradi. Men uni yaratish jarayonini ham ochiq olib boryapman.",
    },
  },
  {
    slug: "pm-guide",
    status: "live",
    url: "https://pm-guide.vercel.app/",
    title: "The Ultimate Guide to Product Management",
    tagline: {
      en: "A comprehensive, practical resource for aspiring and experienced product managers.",
      ru: "Практическое руководство по продуктовому менеджменту для тех, кто только начинает, и тех, у кого уже есть опыт.",
      uz: "Product-menejmentni endi oʻrganayotganlar va bu sohada tajribaga ega mutaxassislar uchun amaliy qoʻllanma.",
    },
    body: {
      en: "Covers core PM concepts, frameworks, and real-world applications to help you excel in product management roles.",
      ru: "В нём собраны основные концепции, фреймворки и примеры из практики, которые помогут увереннее работать в продуктовом менеджменте и развиваться в этой сфере.",
      uz: "Unda product-menejmentning asosiy tushunchalari, freymvorklar va amaliy misollar jamlangan. Bular sohada puxtaroq ishlash va rivojlanishga yordam beradi.",
    },
  },
  {
    slug: "personal-os",
    status: "live",
    github: "https://github.com/sagdish/personal_OS-",
    title: "Personal OS",
    tagline: {
      en: "Your life as plain text files, read by an AI once a day.",
      ru: "Твоя жизнь в обычных текстовых файлах. Раз в день их просматривает ИИ.",
      uz: "Hayotingiz oddiy matn fayllarida saqlanadi. AI esa ularni kuniga bir marta koʻrib chiqadi.",
    },
    body: {
      en: "Your life as plain text files on your own computer. Once a day an AI reads them and tells you where you stand across the areas of your life, in your own words, with no score and no nagging. A ten-minute setup builds it around you: your areas, your voice, your rhythm. It is not a task manager or a habit app with streaks.",
      ru: "Вся твоя жизнь хранится на собственном компьютере в обычных текстовых файлах. Раз в день ИИ просматривает их и помогает увидеть, что происходит в разных сферах жизни. Без баллов, нравоучений и напоминаний о несделанном. Десять минут на настройку, и система подстроена под тебя: твои сферы жизни, твой язык, твой ритм. Это не таск-менеджер и не приложение для привычек с сериями достижений.",
      uz: "Hayotingiz oʻz kompyuteringizda oddiy matn fayllari koʻrinishida saqlanadi. AI ularni kuniga bir marta koʻrib chiqib, hayotingizning turli sohalarida nimalar boʻlayotganini oʻz soʻzlaringiz bilan aks ettiradi. Hech qanday ball, tanbeh yoki tinimsiz eslatmalar yoʻq. Oʻn daqiqada sozlab olasiz: hayotingizdagi yoʻnalishlar, oʻzingizga xos ifoda va ritm. Bu vazifalar menejeri ham, ketma-ket kunlarni sanaydigan odatlar trekeri ham emas.",
    },
    who: {
      en: "Anyone who wants to keep several parts of their life in view without a task manager or streaks. No coding needed: you type a few commands and the AI does the rest.",
      ru: "Для тех, кто хочет видеть, что происходит в разных сферах жизни, но не хочет заводить таск-менеджер или считать серии привычек. Программировать не нужно: достаточно ввести несколько команд, дальше всё сделает ИИ.",
      uz: "Hayotining turli yoʻnalishlarida nimalar boʻlayotganini kuzatib borishni, ammo task-menejer yoki odatlar seriyasini sanaydigan ilovadan foydalanishni istamaydiganlar uchun. Kod yozish shart emas: bir nechta buyruq kiritasiz, qolganini AI bajaradi.",
    },
    how: [
      {
        en: "Install it with one command, then answer a short setup interview inside Claude Code: your areas, your voice, your rhythm.",
        ru: "Устанавливаешь одной командой, а затем проходишь короткую настройку в Claude Code: рассказываешь о важных для тебя сферах жизни, своей манере общения и привычном ритме.",
        uz: "Bitta buyruq bilan oʻrnatasiz, keyin Claude Code ichida qisqa savollarga javob berib, tizimni oʻzingizga moslaysiz: hayotingizdagi muhim yoʻnalishlar, muloqot uslubingiz va kundalik ritmingiz.",
      },
      {
        en: "Write anything, anywhere in your journal: on the page, inside Claude, or on your phone through Obsidian.",
        ru: "Записываешь в дневник всё, что считаешь нужным, и где удобно: на странице, в Claude или с телефона через Obsidian.",
        uz: "Kundaligingizga xohlagan narsangizni qulay joyda yozishingiz mumkin: sahifaning oʻzida, Claude ichida yoki telefondan Obsidian orqali.",
      },
      {
        en: "Once a day the read arrives: where you stand, one line per area, what moved, and at most one question.",
        ru: "Раз в день получаешь короткий обзор: по одной строке о каждой сфере жизни, что изменилось и, если нужно, один вопрос.",
        uz: "Kuniga bir marta qisqa xulosa olasiz: har bir yoʻnalish boʻyicha bir qatordan, nimalar oʻzgargani va kerak boʻlsa, bitta savol.",
      },
      {
        en: "Everything stays on your computer as plain text files. Only the daily read goes to your AI provider.",
        ru: "Все данные остаются на твоём компьютере в обычных текстовых файлах. ИИ-провайдеру отправляется только ежедневная сводка.",
        uz: "Barcha maʼlumotlar kompyuteringizda oddiy matn fayllari sifatida saqlanadi. AI-provayderga faqat kunlik xulosa yuboriladi.",
      },
    ],
    now: {
      en: "Ready to install from GitHub: one command on Mac and Linux, step by step on Windows. It needs a Claude Pro or Max subscription.",
      ru: "Проект можно установить с GitHub: на Mac и Linux достаточно одной команды, на Windows установка выполняется по шагам. Понадобится подписка Claude Pro или Max.",
      uz: "GitHub orqali oʻrnatish mumkin: Mac va Linuxda bitta buyruq kifoya, Windowsda esa koʻrsatmalar boʻyicha bosqichma-bosqich oʻrnatasiz. Claude Pro yoki Max obunasi kerak.",
    },
  },
  {
    slug: "pomodoro-focus-dock",
    status: "pre-start",
    title: "Pomodoro Focus Dock",
    tagline: {
      en: "A focus timer that lives on the dock.",
      ru: "Таймер для концентрации, который всегда под рукой в доке.",
      uz: "Dock panelida turadigan diqqat taymeri.",
    },
    body: {
      en: "A small, always-there focus timer that sits on the dock and keeps a session honest.",
      ru: "Небольшой таймер для концентрации, который находится прямо в доке и помогает не отвлекаться до конца сессии.",
      uz: "Dock panelida doim koʻz oldingizda turadigan, diqqat bilan ishlash sessiyasini oxirigacha davom ettirishga yordam beradigan ixcham taymer.",
    },
  },
  {
    slug: "screenshots-processor",
    status: "progress",
    title: "Screenshots Processor",
    tagline: {
      en: "Turns a pile of screenshots into something useful.",
      ru: "Превращает папку со скриншотами в полезную информацию.",
      uz: "Skrinshotlar toʻplamidan foydali maʼlumot yaratadi.",
    },
    body: {
      en: "Point it at a folder of screenshots and get back something structured and searchable.",
      ru: "Указываешь папку со скриншотами, а на выходе получаешь упорядоченный материал, по которому можно искать.",
      uz: "Skrinshotlar papkasini koʻrsatasiz, natijada tartiblangan va ichidan qidirish mumkin boʻlgan maʼlumot olasiz.",
    },
  },
  {
    slug: "finkeep",
    status: "progress",
    title: "finKeep",
    tagline: {
      en: "A booking tool for psychologists and personal coaches.",
      ru: "Сервис для записи клиентов к психологам и персональным коучам.",
      uz: "Psixologlar va shaxsiy kouçlar uchun mijozlarni qabulga yozish xizmati.",
    },
    body: {
      en: "A booking tool for psychologists and personal coaches.",
      ru: "Сервис для записи клиентов к психологам и персональным коучам.",
      uz: "Psixologlar va shaxsiy kouçlar uchun mijozlarni qabulga yozish xizmati.",
    },
  },
]

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug)

export const loc = (value: Localized, locale: Locale) =>
  value[locale] ?? value.en
