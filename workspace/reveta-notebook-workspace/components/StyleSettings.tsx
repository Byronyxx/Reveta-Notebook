'use client'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Primitives'
import {
  StylePreference, DEFAULT_STYLE,
  ResponseLength, ResponseFormality, ResponseFormat,
  CHAT_LANGUAGES,
} from '@/lib/ai/prompts'

// ── OPTION DEFINITIONS ────────────────────────────────────────────────────────

const LENGTH_OPTIONS: { value: ResponseLength; label: string; hint: string }[] = [
  { value: 'concise',       label: 'Concise',       hint: '1–3 paragraphs, key insight only' },
  { value: 'medium',        label: 'Medium',         hint: 'Balanced depth and breadth' },
  { value: 'detailed',      label: 'Detailed',       hint: 'Thorough with context and nuance' },
  { value: 'comprehensive', label: 'Comprehensive',  hint: 'Complete coverage, headers when useful' },
]

const FORMALITY_OPTIONS: { value: ResponseFormality; label: string; hint: string }[] = [
  { value: 'casual',   label: 'Casual',   hint: 'Conversational, contractions fine' },
  { value: 'neutral',  label: 'Neutral',  hint: 'Clear and professional' },
  { value: 'formal',   label: 'Formal',   hint: 'Precise, no contractions' },
  { value: 'academic', label: 'Academic', hint: 'Rigorous, hedged claims, scholarly tone' },
]

const FORMAT_OPTIONS: { value: ResponseFormat; label: string; hint: string }[] = [
  { value: 'prose',      label: 'Prose',      hint: 'Flowing paragraphs' },
  { value: 'bullets',    label: 'Bullets',    hint: 'Scannable list format' },
  { value: 'structured', label: 'Structured', hint: 'Headers, bullets, visual hierarchy' },
]

// ── PILL SELECTOR ─────────────────────────────────────────────────────────────

function PillSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string; hint: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-reveta-2">
      <p className="reveta-label text-text-secondary">{label}</p>
      <div className="flex flex-wrap gap-reveta-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.hint}
            className={[
              'px-reveta-3 h-8 rounded-component reveta-label',
              'border transition-all duration-quick',
              value === opt.value
                ? 'bg-primary-800 border-primary-400 text-primary-100'
                : 'surface-ground border-border-default text-text-secondary hover:text-text-primary hover:border-neutral-600',
            ].join(' ')}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {/* Active hint */}
      <p className="reveta-label text-text-secondary opacity-60">
        {options.find(o => o.value === value)?.hint}
      </p>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function StyleSettings({ onClose }: { onClose: () => void }) {
  const [style, setStyle] = useState<StylePreference>(DEFAULT_STYLE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => { if (d.style) setStyle(d.style) })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(style),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  const handleReset = () => setStyle(DEFAULT_STYLE)

  const isChanged = JSON.stringify(style) !== JSON.stringify(DEFAULT_STYLE)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-reveta-8">
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-reveta-5 px-reveta-5 py-reveta-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="reveta-h2 text-text-primary">Response Style</h2>
          <p className="reveta-caption text-text-secondary mt-reveta-1">
            Applies to all chat responses in every notebook. Settings persist to your account.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-quick rounded"
          aria-label="Close settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Length */}
      <PillSelector
        label="Response length"
        options={LENGTH_OPTIONS}
        value={style.length}
        onChange={length => setStyle(s => ({ ...s, length }))}
      />

      {/* Formality */}
      <PillSelector
        label="Tone & formality"
        options={FORMALITY_OPTIONS}
        value={style.formality}
        onChange={formality => setStyle(s => ({ ...s, formality }))}
      />

      {/* Format */}
      <PillSelector
        label="Output format"
        options={FORMAT_OPTIONS}
        value={style.format}
        onChange={format => setStyle(s => ({ ...s, format }))}
      />

      {/* Language (FR-18) */}
      <div className="flex flex-col gap-reveta-2">
        <p className="reveta-label text-text-secondary">Response language</p>
        <select
          value={style.language}
          onChange={e => setStyle(s => ({ ...s, language: e.target.value }))}
          className={[
            'h-10 px-reveta-3 surface-ground border border-border-default rounded-component',
            'reveta-caption text-text-primary w-full',
            'outline-none transition-[border-color] duration-quick hover:border-neutral-600',
          ].join(' ')}
          aria-label="Response language"
        >
          {CHAT_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
        {style.language !== 'en' && (
          <p className="reveta-label text-signal-300">
            Claude will respond in {CHAT_LANGUAGES.find(l => l.code === style.language)?.label} for all notebooks
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-reveta-3 pt-reveta-2 border-t border-border-default">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          loading={saving}
          icon={saved
            ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : undefined
          }
        >
          {saved ? 'Saved' : 'Save preferences'}
        </Button>
        {isChanged && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset to defaults
          </Button>
        )}
      </div>
    </div>
  )
}
