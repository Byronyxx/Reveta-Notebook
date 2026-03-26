'use client'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Primitives'
import { StylePreference, DEFAULT_STYLE, ResponseLength, ResponseFormality, ResponseFormat, CHAT_LANGUAGES } from '@/lib/ai/prompts'

const LENGTH_OPTIONS: { value: ResponseLength; label: string; hint: string }[] = [
  { value: 'concise', label: 'Concise', hint: '1–3 paragraphs, key insight only' },
  { value: 'medium', label: 'Medium', hint: 'Balanced depth and breadth' },
  { value: 'detailed', label: 'Detailed', hint: 'Thorough with context and nuance' },
  { value: 'comprehensive', label: 'Comprehensive', hint: 'Complete coverage, headers when useful' },
]
const FORMALITY_OPTIONS: { value: ResponseFormality; label: string; hint: string }[] = [
  { value: 'casual', label: 'Casual', hint: 'Conversational, contractions fine' },
  { value: 'neutral', label: 'Neutral', hint: 'Clear and professional' },
  { value: 'formal', label: 'Formal', hint: 'Precise, no contractions' },
  { value: 'academic', label: 'Academic', hint: 'Rigorous, hedged claims, scholarly tone' },
]
const FORMAT_OPTIONS: { value: ResponseFormat; label: string; hint: string }[] = [
  { value: 'prose', label: 'Prose', hint: 'Flowing paragraphs' },
  { value: 'bullets', label: 'Bullets', hint: 'Scannable list format' },
  { value: 'structured', label: 'Structured', hint: 'Headers, bullets, visual hierarchy' },
]

function PillSelector<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string; hint: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-reveta-2">
      <p className="reveta-label text-text-secondary">{label}</p>
      <div className="flex flex-wrap gap-reveta-2">
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)} title={opt.hint} className={['px-reveta-3 h-8 rounded-component reveta-label border transition-all duration-quick', value === opt.value ? 'bg-primary-800 border-primary-400 text-primary-100' : 'surface-ground border-border-default text-text-secondary hover:text-text-primary hover:border-neutral-600'].join(' ')} aria-pressed={value === opt.value}>{opt.label}</button>
        ))}
      </div>
      <p className="reveta-label text-text-secondary opacity-60">{options.find(o => o.value === value)?.hint}</p>
    </div>
  )
}

export default function StyleSettings({ value, onChange }: { value: StylePreference; onChange: (s: StylePreference) => void }) {
  return (
    <div className="surface-ground rounded-large p-reveta-4 border border-border-default flex flex-col gap-reveta-4">
      <p className="reveta-label text-text-secondary font-medium">Response Style</p>
      <PillSelector label="Length" options={LENGTH_OPTIONS} value={value.length} onChange={length => onChange({ ...value, length })} />
      <PillSelector label="Formality" options={FORMALITY_OPTIONS} value={value.formality} onChange={formality => onChange({ ...value, formality })} />
      <PillSelector label="Format" options={FORMAT_OPTIONS} value={value.format} onChange={format => onChange({ ...value, format })} />
      <div className="flex flex-col gap-reveta-1">
        <p className="reveta-label text-text-secondary">Language</p>
        <select value={value.language} onChange={e => onChange({ ...value, language: e.target.value })} className="h-9 px-reveta-2 surface-ground border border-border-default rounded-component reveta-label text-text-primary outline-none transition-[border-color] duration-quick hover:border-neutral-600" aria-label="Response language">
          {CHAT_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
        </select>
      </div>
    </div>
  )
}
