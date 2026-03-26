'use client'
import { useState, useCallback } from 'react'
import Button from '@/components/ui/Button'
import { CHAT_LANGUAGES, ResponseLength, ResponseFormality, ResponseFormat, StylePreference, DEFAULT_STYLE } from '@/lib/ai/prompts'

interface NotebookPrefs { stylePreference: StylePreference; responseLanguage: string }

const LENGTH_OPTIONS: { value: ResponseLength; label: string; hint: string }[] = [
  { value: 'concise', label: 'Concise', hint: '1–3 paragraphs · dense & direct' },
  { value: 'medium', label: 'Medium', hint: '3–5 paragraphs · balanced depth' },
  { value: 'detailed', label: 'Detailed', hint: 'Full explanation with context' },
  { value: 'comprehensive', label: 'Comprehensive', hint: 'Headers, examples, full breakdown' },
]
const FORMALITY_OPTIONS: { value: ResponseFormality; label: string; hint: string }[] = [
  { value: 'casual', label: 'Casual', hint: 'Friendly, conversational, accessible' },
  { value: 'neutral', label: 'Neutral', hint: 'Clear & balanced — the default' },
  { value: 'formal', label: 'Formal', hint: 'Professional, precise, no contractions' },
  { value: 'academic', label: 'Academic', hint: 'Rigorous, hedged, explicit reasoning' },
]
const FORMAT_OPTIONS: { value: ResponseFormat; label: string; hint: string }[] = [
  { value: 'prose', label: 'Prose', hint: 'Flowing paragraphs — best for analysis' },
  { value: 'bullets', label: 'Bullets', hint: 'Scannable lists — best for reference' },
  { value: 'structured', label: 'Structured', hint: 'Headers + bullets + visual hierarchy' },
]

function ChipSelector<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string; hint: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="flex flex-col gap-reveta-2">
      <p className="reveta-label text-text-secondary font-medium">{label}</p>
      <div className="flex flex-wrap gap-reveta-2">
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)} className={['group flex flex-col items-start px-reveta-3 py-reveta-2 rounded-component border transition-all duration-quick text-left min-w-[120px]', value === opt.value ? 'surface-brand-border bg-primary-800 border-primary-600 text-primary-100' : 'surface-ground border-border-default text-text-secondary hover:border-neutral-600 hover:text-text-primary'].join(' ')} aria-pressed={value === opt.value}>
            <span className="reveta-caption font-medium">{opt.label}</span>
            <span className={['reveta-label mt-0.5', value === opt.value ? 'text-primary-300' : 'text-text-secondary'].join(' ')}>{opt.hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function NotebookPreferences({ notebookId, onClose }: { notebookId: string; onClose: () => void }) {
  const [style, setStyle] = useState<StylePreference>(DEFAULT_STYLE)
  const [language, setLanguage] = useState('en')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateStyle = useCallback(<K extends keyof StylePreference>(key: K, value: StylePreference[K]) => {
    setStyle(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/notebooks/${notebookId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stylePreference: { length: style.length, formality: style.formality, format: style.format }, responseLanguage: language }) })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => { setSaved(false); onClose() }, 1200) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-reveta-4">
      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative surface-float rounded-large w-full max-w-2xl shadow-2xl border border-border-default flex flex-col max-h-[90vh]" role="dialog" aria-modal="true" aria-labelledby="prefs-modal-title">
        <div className="flex items-center justify-between px-reveta-5 py-reveta-4 border-b border-border-default shrink-0">
          <div>
            <h2 id="prefs-modal-title" className="reveta-h3 text-text-primary">Notebook Preferences</h2>
            <p className="reveta-label text-text-secondary mt-0.5">Chat response style and language</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-quick rounded" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-reveta-5 py-reveta-5 flex flex-col gap-reveta-6">
          <section>
            <h3 className="reveta-h4 text-text-primary mb-reveta-4">Response Style</h3>
            <div className="flex flex-col gap-reveta-5">
              <ChipSelector label="Length" options={LENGTH_OPTIONS} value={style.length} onChange={v => updateStyle('length', v)} />
              <ChipSelector label="Tone" options={FORMALITY_OPTIONS} value={style.formality} onChange={v => updateStyle('formality', v)} />
              <ChipSelector label="Format" options={FORMAT_OPTIONS} value={style.format} onChange={v => updateStyle('format', v)} />
            </div>
          </section>
          <section>
            <h3 className="reveta-h4 text-text-primary mb-reveta-2">Response Language</h3>
            <select value={language} onChange={e => { setLanguage(e.target.value); setSaved(false) }} className="w-full h-10 px-reveta-3 surface-ground border border-border-default rounded-component reveta-caption text-text-primary outline-none transition-[border-color] duration-quick hover:border-neutral-600 focus:surface-signal-glow" aria-label="Response language">
              {CHAT_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
            </select>
          </section>
        </div>
        <div className="flex items-center justify-between px-reveta-5 py-reveta-4 border-t border-border-default shrink-0">
          <p className="reveta-label text-text-secondary">Settings apply to all chats in this notebook.</p>
          <div className="flex items-center gap-reveta-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>{saved ? 'Saved!' : 'Save preferences'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
