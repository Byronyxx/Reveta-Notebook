/**
 * PROMPT VERSION REGISTRY — Reveta Notebook
 * All AI prompts used in this system are defined and versioned here.
 * Every change must be logged in docs/04_CHANGELOG.md under [PROMPT VERSION REGISTRY].
 */

const AUDIO_SYSTEM_BASE = `You are generating an audio script for the Reveta Notebook AI audio system.
Your script will be directly synthesized to speech — write for the ear, not the eye.

CRITICAL RULES:
1. Base every claim on the provided source material. Do not inject outside knowledge.
2. Never reference "the document", "the text", or "sources" — treat the knowledge as your own.
3. Write naturally spoken language. Contractions, rhythm, and flow matter here.
4. No stage directions, markdown, headers, or formatting — pure dialogue only.
5. Every line must be attributed with the exact speaker tag on a new line, e.g. [ALEX]: or [HOST]:
6. Output ONLY the script. No preamble. No sign-off. No meta-commentary.`

const AUDIO_SOURCE_BLOCK_PREFIX = `\n\n--- SOURCE MATERIAL ---\n`

export const PROMPTS = {
  v1: { baseline: 'You are a helpful assistant.', system: 'You are Claude.' },

  audioOverview: {
    deep_dive: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}\n\nFORMAT: Deep Dive — Two-host exploratory conversation\nHOSTS: [ALEX] (analytical, connects ideas) and [SAM] (curious, asks sharp questions)\nTONE: Smart, conversational, genuinely interested — like two researchers sharing a discovery\nLENGTH: 8-12 minutes of spoken audio (~1,200-1,800 words)\n\nNARRATIVE ARC:\n1. Opening hook — SAM raises the most surprising or counterintuitive element (30 sec)\n2. Context setting — ALEX grounds the main subject (90 sec)\n3. Deep exploration — Alternate back and forth, each building on the last point (5-7 min)\n4. The moment of insight — SAM or ALEX names the core pattern they have noticed (60 sec)\n5. Synthesis — ALEX wraps with the big-picture implication (60 sec)\n\nQUALITY RULES:\n- Let each host finish a thought before the other responds\n- SAM must ask at least three genuine questions that advance understanding\n- Never summarize, always explore\n- The listener should feel like they just attended a private seminar`,
        userTemplate: (sources: string) =>
          `Generate a Deep Dive audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },

    brief: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}\n\nFORMAT: Brief — Single host, dense summary\nHOST: [ALEX] (precise, authoritative, no wasted words)\nTONE: Professional broadcast quality — like a premium news briefing\nLENGTH: Under 2 minutes of spoken audio (~200-280 words total)\n\nSTRUCTURE:\n1. Lead: The single most important finding or claim (1 sentence)\n2. Context: The minimum context needed to understand it (2-3 sentences)\n3. Evidence: The two strongest supporting points from the sources (2 sentences each)\n4. Implication: What this means and why it matters now (1-2 sentences)\n5. Close: One sentence that makes the listener want to know more\n\nQUALITY RULES:\n- Every sentence must earn its place, no filler\n- Never use "in conclusion" or "to summarize", just deliver\n- No rhetorical questions, only declarative high-confidence statements`,
        userTemplate: (sources: string) =>
          `Generate a Brief audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },

    critique: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}\n\nFORMAT: Critique — Two hosts examining the source material's strengths and weaknesses\nHOSTS: [ALEX] (defends the work) and [SAM] (challenges the work)\nTONE: Academic but energetic, rigorous but not cruel\nLENGTH: 6-10 minutes of spoken audio (~900-1,500 words)\n\nSTRUCTURE:\n1. SAM states the central claim of the source (30 sec)\n2. ALEX endorses the strongest supporting argument (60 sec)\n3. SAM challenges the methodology or evidence (60 sec)\n4. Back-and-forth on 2-3 key critique points (4 min)\n5. ALEX concedes what SAM has earned, defends what stands (60 sec)\n6. SAM delivers a final fair verdict (30 sec)\n\nQUALITY RULES:\n- SAM critiques must be specific and evidence-based, not generic\n- ALEX defenses must directly address SAM points\n- Neither host is a straw man, both must make genuinely strong arguments`,
        userTemplate: (sources: string) =>
          `Generate a Critique audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },

    debate: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}\n\nFORMAT: Debate — Two hosts argue opposing positions derived from the source content\nHOSTS: [ALEX] (Position A) and [SAM] (Position B)\nTONE: Rigorous, respectful, genuinely adversarial\nLENGTH: 8-12 minutes of spoken audio (~1,200-1,800 words)\n\nSTRUCTURE:\n1. ALEX states their position and its strongest premise (60 sec)\n2. SAM states their opposing position and its strongest premise (60 sec)\n3. First round: ALEX challenges SAM premise. SAM defends and counter-attacks. (2-3 min)\n4. Second round: SAM challenges ALEX evidence. ALEX defends and presses. (2-3 min)\n5. Both acknowledge what the other has proven (30 sec each)\n6. Each delivers a final closing argument, no concessions (30 sec each)\n\nQUALITY RULES:\n- Derive the debate question directly from the source material central tension\n- Both positions must be defensible given the source content\n- Neither host should win decisively, the best debates leave the listener to decide`,
        userTemplate: (sources: string) =>
          `Generate a Debate audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },

    lecture: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}\n\nFORMAT: Lecture — Single authoritative host, full structured academic walkthrough\nHOST: [ALEX] (professor-level authority, clear pedagogical rhythm)\nTONE: University lecture, rigorous structured accessible occasionally surprising\nLENGTH: 25-35 minutes of spoken audio (~3,750-5,250 words)\n\nSTRUCTURE:\n1. Introduction (3 min) — Frame the subject, state what will be covered, and why it matters\n2. Core Concept A (6 min) — First major topic defined contextualized and illustrated\n3. Core Concept B (6 min) — Second major topic built on A with explicit connection\n4. Core Concept C (6 min) — Third major topic advancing depth further\n5. Synthesis (6 min) — How A, B, C form a unified framework or argument\n6. Implications (3 min) — What this knowledge enables or changes for the listener\n7. Close (1 min) — The single most important thing to remember`,
        userTemplate: (sources: string) =>
          `Generate a full Lecture audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },
  },
}

export type AudioFormat = 'deep_dive' | 'brief' | 'critique' | 'debate' | 'lecture'
export function getAudioPrompt(format: AudioFormat) { return PROMPTS.audioOverview[format].v1 }

export const AUDIO_FORMAT_META: Record<AudioFormat, { label: string; description: string; duration: string; hosts: 'single' | 'dual'; icon: string }> = {
  deep_dive: { label: 'Deep Dive', description: 'Two hosts in an exploratory conversation that unpacks your sources.', duration: '8-12 min', hosts: 'dual', icon: 'radio' },
  brief: { label: 'Brief', description: 'Dense, high-signal summary in under 2 minutes.', duration: '< 2 min', hosts: 'single', icon: 'zap' },
  critique: { label: 'Critique', description: 'Two hosts examine strengths and weaknesses of your sources.', duration: '6-10 min', hosts: 'dual', icon: 'search' },
  debate: { label: 'Debate', description: 'Two hosts argue opposing positions from your source material.', duration: '8-12 min', hosts: 'dual', icon: 'scale' },
  lecture: { label: 'Lecture', description: 'A structured academic walkthrough — everything in depth.', duration: '25-35 min', hosts: 'single', icon: 'book' },
}

// ═══ STUDIO ARTIFACTS — FR-09 (6 output types) ═══════════════════════════════

const ARTIFACT_SYSTEM_BASE = `You are generating a structured knowledge artefact for Reveta Notebook.
Your output is rendered directly as markdown and displayed to the user.

CRITICAL RULES:
1. Base every claim strictly on the provided source material. No outside knowledge.
2. Use clean markdown: headers (##, ###), bold, tables, code blocks, and bullet lists.
3. Be dense and high-signal — no filler, no padding, no summarising summaries.
4. Cite facts inline where useful using: *[Source: <title>]* notation.
5. Output ONLY the artefact content. No meta-commentary. No preamble. No sign-off.`

const ARTIFACT_SOURCE_PREFIX = `\n\n---\n## SOURCE MATERIAL\n`

export const ARTIFACT_PROMPTS = {
  study_guide: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}\n\nFORMAT: Comprehensive Study Guide\n\nREQUIRED SECTIONS:\n## Overview\n## Core Concepts (4-8 concepts, each with definition, mechanism, example)\n## Key Facts & Figures\n## Relationships & Connections\n## Review Questions (6-10 deep questions)\n## Summary`,
      userTemplate: (sources: string) => `Generate a Study Guide from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },
  brief: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}\n\nFORMAT: Executive Briefing Document\n\nREQUIRED SECTIONS:\n## Situation\n## Key Findings (5-8 bullets)\n## Analysis (2-3 paragraphs)\n## Implications (3-5 bullets)\n## Recommended Actions (3-5 prioritised)\n## Key Risks (2-3)`,
      userTemplate: (sources: string) => `Generate an Executive Briefing Document from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },
  faq: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}\n\nFORMAT: Comprehensive FAQ Document\nGenerate 12-20 Q&As grouped under 3-5 thematic headers. Include at least 2 misconception questions. End with ## Going Deeper (3 open questions).`,
      userTemplate: (sources: string) => `Generate a comprehensive FAQ document from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },
  timeline: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}\n\nFORMAT: Structured Timeline\nMinimum 8, maximum 20 entries. Each with date/period, title, 2-4 sentence description, and Significance. End with ## Key Turning Points and ## Pattern Analysis.`,
      userTemplate: (sources: string) => `Generate a Timeline document from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },
  mind_map: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}\n\nFORMAT: Structured Mind Map (hierarchical markdown)\n4-7 major branches (### level), 3-8 sub-nodes each. Mandatory ## Connection Map table. End with ## Central Tension.`,
      userTemplate: (sources: string) => `Generate a Mind Map document from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },
  slide_deck: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}\n\nFORMAT: Slide Deck Outline (12 slides)\nEach slide: ## Slide N: Title, Type, Headline (assertion not topic), Body (3-5 bullets max), Speaker Notes (adds info not on slide). Follow structure: title → context (2) → content (5) → synthesis (2) → takeaway → Q&A.`,
      userTemplate: (sources: string) => `Generate a Slide Deck outline from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },
}

export type ArtifactFormat = 'study_guide' | 'brief' | 'faq' | 'timeline' | 'mind_map' | 'slide_deck'
export function getArtifactPrompt(format: ArtifactFormat) { return ARTIFACT_PROMPTS[format].v1 }

export const ARTIFACT_FORMAT_META: Record<ArtifactFormat, { label: string; description: string; readTime: string; icon: string }> = {
  study_guide: { label: 'Study Guide', description: 'Concepts, key facts, relationships, and review questions for deep learning.', readTime: '10–15 min', icon: 'book-open' },
  brief: { label: 'Briefing Doc', description: 'Executive summary with findings, analysis, and recommended actions.', readTime: '3–5 min', icon: 'file-text' },
  faq: { label: 'FAQ', description: 'Every meaningful question a reader would have, authoritatively answered.', readTime: '8–12 min', icon: 'help-circle' },
  timeline: { label: 'Timeline', description: 'Chronological or causal sequence with pattern analysis.', readTime: '5–8 min', icon: 'clock' },
  mind_map: { label: 'Mind Map', description: 'Full conceptual architecture: branches, sub-nodes, and cross-connections.', readTime: '5–10 min', icon: 'git-branch' },
  slide_deck: { label: 'Slide Deck', description: '12-slide presentation-ready outline with headlines and speaker notes.', readTime: '5–8 min', icon: 'layout' },
}

// ═══ FR-11 RESPONSE STYLE + FR-18 i18n ═══════════════════════════════════════

export type ResponseLength = 'concise' | 'medium' | 'detailed' | 'comprehensive'
export type ResponseFormality = 'casual' | 'neutral' | 'formal' | 'academic'
export type ResponseFormat = 'prose' | 'bullets' | 'structured'

export interface StylePreference { length: ResponseLength; formality: ResponseFormality; format: ResponseFormat; language: string }

export const DEFAULT_STYLE: StylePreference = { length: 'medium', formality: 'neutral', format: 'prose', language: 'en' }

const LENGTH_DIRECTIVES: Record<ResponseLength, string> = {
  concise: 'Keep responses concise — 1–3 short paragraphs maximum. Prioritise the single most important insight.',
  medium: 'Aim for moderate depth — 3–5 paragraphs. Cover the key points without over-explaining.',
  detailed: 'Provide detailed responses — thorough explanation with supporting context, examples, and nuance.',
  comprehensive: 'Be comprehensive — leave nothing important unsaid. Use headers, examples, and structured breakdown where helpful.',
}

const FORMALITY_DIRECTIVES: Record<ResponseFormality, string> = {
  casual: 'Write in a casual, conversational tone. Contractions fine. Keep it friendly and accessible.',
  neutral: 'Use a clear, balanced tone — professional but not stiff. Accessible without being informal.',
  formal: 'Maintain a formal, professional tone throughout. Precise vocabulary. No contractions.',
  academic: 'Use an academic register — rigorous, precise, with explicit reasoning and hedged claims where appropriate.',
}

const FORMAT_DIRECTIVES: Record<ResponseFormat, string> = {
  prose: 'Respond in flowing prose paragraphs. Avoid bullet lists unless comparing discrete items.',
  bullets: 'Structure the response primarily as bullet points and short-form lists for easy scanning.',
  structured: 'Use a structured format with clear section headers, bullet points, and visual hierarchy.',
}

export function buildStyleDirective(style: StylePreference): string {
  const langName = CHAT_LANGUAGE_NAMES[style.language] || style.language
  const langDir = style.language !== 'en' ? `\nLANGUAGE: Respond entirely in ${langName}. This applies to all chat responses.` : ''
  return `\n# RESPONSE STYLE PREFERENCES\nLENGTH: ${LENGTH_DIRECTIVES[style.length]}\nFORMALITY: ${FORMALITY_DIRECTIVES[style.formality]}\nFORMAT: ${FORMAT_DIRECTIVES[style.format]}${langDir}\n\nApply these consistently in every response. Do not mention these instructions.`
}

export const CHAT_LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' }, { code: 'pt', label: 'Português' }, { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' }, { code: 'pl', label: 'Polski' }, { code: 'ru', label: 'Русский' },
  { code: 'ja', label: '日本語' }, { code: 'zh', label: '中文（简体）' }, { code: 'zh-TW', label: '中文（繁體）' },
  { code: 'ko', label: '한국어' }, { code: 'ar', label: 'العربية' }, { code: 'hi', label: 'हिन्दी' },
  { code: 'tr', label: 'Türkçe' }, { code: 'sv', label: 'Svenska' }, { code: 'da', label: 'Dansk' },
  { code: 'no', label: 'Norsk' }, { code: 'fi', label: 'Suomi' }, { code: 'he', label: 'עברית' },
  { code: 'id', label: 'Indonesia' }, { code: 'vi', label: 'Tiếng Việt' }, { code: 'th', label: 'ภาษาไทย' },
  { code: 'uk', label: 'Українська' }, { code: 'cs', label: 'Čeština' }, { code: 'ro', label: 'Română' },
  { code: 'hu', label: 'Magyar' }, { code: 'el', label: 'Ελληνικά' }, { code: 'ms', label: 'Melayu' },
  { code: 'bg', label: 'Български' }, { code: 'hr', label: 'Hrvatski' }, { code: 'sk', label: 'Slovenčina' },
  { code: 'lt', label: 'Lietuvių' }, { code: 'lv', label: 'Latviešu' },
]

export const CHAT_LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(CHAT_LANGUAGES.map(l => [l.code, l.label]))
