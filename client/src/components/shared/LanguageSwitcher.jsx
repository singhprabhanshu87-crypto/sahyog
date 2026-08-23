import { Globe } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { useUiStore } from '@/store/ui.store'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'sat', label: 'Santali' },
  { code: 'hoc', label: 'Ho' },
  { code: 'unr', label: 'Kurukh' },
]

export function LanguageSwitcher({ compact = false }) {
  const locale = useUiStore((s) => s.locale)
  const setLocale = useUiStore((s) => s.setLocale)

  if (compact) {
    return (
      <Select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="w-28 h-8 text-small"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </Select>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
      <Select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="w-32 h-8 text-small"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </Select>
    </div>
  )
}
