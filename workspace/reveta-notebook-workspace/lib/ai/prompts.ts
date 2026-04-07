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
  v1: {
    baseline: 'You are a helpful assistant.',
    system: 'You are Claude.',
  },

  audioOverview: {
    deep_dive: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}

FORMAT: Deep Dive — Two-host exploratory conversation
HOSTS: [ALEX] (analytical, connects ideas) and [SAM] (curious, asks sharp questions)
TONE: Smart, conversational, genuinely interested — like two researchers sharing a discovery
LENGTH: 8-12 minutes of spoken audio (~1,200-1,800 words)

NARRATIVE ARC:
1. Opening hook — SAM raises the most surprising or counterintuitive element (30 sec)
2. Context setting — ALEX grounds the main subject (90 sec)
3. Deep exploration — Alternate back and forth, each building on the last point (5-7 min)
4. The moment of insight — SAM or ALEX names the core pattern they have noticed (60 sec)
5. Synthesis — ALEX wraps with the big-picture implication (60 sec)

QUALITY RULES:
- Let each host finish a thought before the other responds
- SAM must ask at least three genuine questions that advance understanding
- Never summarize, always explore
- The listener should feel like they just attended a private seminar`,
        userTemplate: (sources: string) =>
          `Generate a Deep Dive audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },

    brief: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}

FORMAT: Brief — Single host, dense summary
HOST: [ALEX] (precise, authoritative, no wasted words)
TONE: Professional broadcast quality — like a premium news briefing
LENGTH: Under 2 minutes of spoken audio (~200-280 words total)

STRUCTURE:
1. Lead: The single most important finding or claim (1 sentence)
2. Context: The minimum context needed to understand it (2-3 sentences)
3. Evidence: The two strongest supporting points from the sources (2 sentences each)
4. Implication: What this means and why it matters now (1-2 sentences)
5. Close: One sentence that makes the listener want to know more

QUALITY RULES:
- Every sentence must earn its place, no filler
- Never use "in conclusion" or "to summarize", just deliver
- No rhetorical questions, only declarative high-confidence statements`,
        userTemplate: (sources: string) =>
          `Generate a Brief audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },

    critique: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}

FORMAT: Critique — Two hosts examining the source material's strengths and weaknesses
HOSTS: [ALEX] (defends the work) and [SAM] (challenges the work)
TONE: Academic but energetic, rigorous but not cruel
LENGTH: 6-10 minutes of spoken audio (~900-1,500 words)

STRUCTURE:
1. SAM states the central claim of the source (30 sec)
2. ALEX endorses the strongest supporting argument (60 sec)
3. SAM challenges the methodology or evidence (60 sec)
4. Back-and-forth on 2-3 key critique points (4 min)
5. ALEX concedes what SAM has earned, defends what stands (60 sec)
6. SAM delivers a final fair verdict (30 sec)

QUALITY RULES:
- SAM critiques must be specific and evidence-based, not generic
- ALEX defenses must directly address SAM points
- Neither host is a straw man, both must make genuinely strong arguments`,
        userTemplate: (sources: string) =>
          `Generate a Critique audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },

    debate: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}

FORMAT: Debate — Two hosts argue opposing positions derived from the source content
HOSTS: [ALEX] (Position A) and [SAM] (Position B)
TONE: Rigorous, respectful, genuinely adversarial
LENGTH: 8-12 minutes of spoken audio (~1,200-1,800 words)

STRUCTURE:
1. ALEX states their position and its strongest premise (60 sec)
2. SAM states their opposing position and its strongest premise (60 sec)
3. First round: ALEX challenges SAM premise. SAM defends and counter-attacks. (2-3 min)
4. Second round: SAM challenges ALEX evidence. ALEX defends and presses. (2-3 min)
5. Both acknowledge what the other has proven (30 sec each)
6. Each delivers a final closing argument, no concessions (30 sec each)

QUALITY RULES:
- Derive the debate question directly from the source material central tension
- Both positions must be defensible given the source content
- Neither host should win decisively, the best debates leave the listener to decide`,
        userTemplate: (sources: string) =>
          `Generate a Debate audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },

    lecture: {
      v1: {
        system: `${AUDIO_SYSTEM_BASE}

FORMAT: Lecture — Single authoritative host, full structured academic walkthrough
HOST: [ALEX] (professor-level authority, clear pedagogical rhythm)
TONE: University lecture, rigorous structured accessible occasionally surprising
LENGTH: 25-35 minutes of spoken audio (~3,750-5,250 words)

STRUCTURE:
1. Introduction (3 min) — Frame the subject, state what will be covered, and why it matters
2. Core Concept A (6 min) — First major topic defined contextualized and illustrated
3. Core Concept B (6 min) — Second major topic built on A with explicit connection
4. Core Concept C (6 min) — Third major topic advancing depth further
5. Synthesis (6 min) — How A, B, C form a unified framework or argument
6. Implications (3 min) — What this knowledge enables or changes for the listener
7. Close (1 min) — The single most important thing to remember

QUALITY RULES:
- Begin each section with a clear signpost such as "Now let us turn to..."
- Use concrete examples to anchor every abstract claim
- Occasional rhetorical questions are permitted to maintain engagement`,
        userTemplate: (sources: string) =>
          `Generate a full Lecture audio script from the following source material.\n${AUDIO_SOURCE_BLOCK_PREFIX}${sources}\n\n--- BEGIN SCRIPT ---`,
      },
    },
  },
}

export type AudioFormat = 'deep_dive' | 'brief' | 'critique' | 'debate' | 'lecture'

export function getAudioPrompt(format: AudioFormat) {
  return PROMPTS.audioOverview[format].v1
}

export const AUDIO_FORMAT_META: Record<AudioFormat, {
  label: string
  description: string
  duration: string
  hosts: 'single' | 'dual'
  icon: string
}> = {
  deep_dive: {
    label: 'Deep Dive',
    description: 'Two hosts in an exploratory conversation that unpacks your sources.',
    duration: '8-12 min',
    hosts: 'dual',
    icon: 'radio',
  },
  brief: {
    label: 'Brief',
    description: 'Dense, high-signal summary in under 2 minutes.',
    duration: '< 2 min',
    hosts: 'single',
    icon: 'zap',
  },
  critique: {
    label: 'Critique',
    description: 'Two hosts examine strengths and weaknesses of your sources.',
    duration: '6-10 min',
    hosts: 'dual',
    icon: 'search',
  },
  debate: {
    label: 'Debate',
    description: 'Two hosts argue opposing positions from your source material.',
    duration: '8-12 min',
    hosts: 'dual',
    icon: 'scale',
  },
  lecture: {
    label: 'Lecture',
    description: 'A structured academic walkthrough — everything in depth.',
    duration: '25-35 min',
    hosts: 'single',
    icon: 'book',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// STUDIO ARTEFACTS — FR-09 (6 output types)
// ═══════════════════════════════════════════════════════════════════════════

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
      system: `${ARTIFACT_SYSTEM_BASE}

FORMAT: Comprehensive Study Guide
PURPOSE: Enable a learner to deeply understand and retain the core knowledge from the sources.

REQUIRED SECTIONS (in order):
## Overview
3-4 sentence synthesis of the central subject and why it matters.

## Core Concepts
For each major concept (4–8 total):
### [Concept Name]
- Definition (precise, jargon-aware)
- Mechanism: how it works
- Example or application from the source

## Key Facts & Figures
Bullet list of the most exam-worthy, citation-worthy facts with source attribution.

## Relationships & Connections
A brief section (or table) showing how the key concepts relate to or build on each other.

## Review Questions
6–10 questions that test deep understanding (not surface recall). No answers provided.

## Summary
One paragraph: the essential argument or insight distilled to its core.`,
      userTemplate: (sources: string) =>
        `Generate a Study Guide from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },

  brief: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}

FORMAT: Executive Briefing Document
PURPOSE: Give a decision-maker everything they need to understand the subject and act on it — in under 5 minutes.

REQUIRED SECTIONS (in order):
## Situation
What is this about and why does it matter now? (2-3 sentences, sharp.)

## Key Findings
5–8 bullet points. Each starts with a bold claim, followed by supporting evidence from the sources.

## Analysis
2–3 paragraphs: the deeper pattern, the tension or tradeoff, the signal beneath the noise.

## Implications
What does this mean for the reader? What changes because of these findings?
Present as 3–5 forward-looking bullet points.

## Recommended Actions
3–5 concrete, prioritised actions. Lead with the highest-leverage one.

## Key Risks
2–3 risks or unknowns the decision-maker should be aware of.`,
      userTemplate: (sources: string) =>
        `Generate an Executive Briefing Document from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },

  faq: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}

FORMAT: Comprehensive FAQ Document
PURPOSE: Anticipate and authoritatively answer every meaningful question a reader would have about this subject.

STRUCTURE:
- Generate 12–20 questions and answers
- Group questions under 3–5 thematic headers (## [Theme])
- Order within each group: fundamental questions first, nuanced ones later
- Questions should be phrased as a curious, intelligent person would ask them
- Answers should be 2-5 sentences: complete, precise, and source-grounded

QUALITY RULES:
- No trivial questions — every Q must unlock real understanding
- No vague answers — every A must be specific and verifiable against the sources
- Include at least 2 "What about...?" or "Why doesn't...?" questions that address common misconceptions
- Finish with a ## Going Deeper section listing 3 questions the sources raise but do not fully answer`,
      userTemplate: (sources: string) =>
        `Generate a comprehensive FAQ document from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },

  timeline: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}

FORMAT: Structured Timeline
PURPOSE: Reveal the chronological structure, causal sequence, and evolution of the subject.

REQUIRED FORMAT:
## Timeline: [Subject Name]

### [Period or Date] — [Event/Phase Title]
[2-4 sentences: what happened, why it happened, and what it caused or enabled]
**Significance:** [One sentence on why this moment matters in the larger arc]

Repeat for each significant event or phase. Minimum 8 entries, maximum 20.

## Key Turning Points
A brief section identifying the 3 moments where the trajectory most decisively changed — and why.

## Pattern Analysis
One paragraph: what the overall arc reveals about the subject's development, recurring forces, or structural dynamics.

CALIBRATION NOTES:
- If the source is not primarily chronological, identify the logical/causal sequence (how ideas build on each other)
- Use approximate dates when exact ones aren't available ("Late 1990s", "Early Phase")
- Never invent dates — mark as [DATE UNSPECIFIED] if not in source`,
      userTemplate: (sources: string) =>
        `Generate a Timeline document from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },

  mind_map: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}

FORMAT: Structured Mind Map (rendered as hierarchical markdown)
PURPOSE: Expose the full conceptual architecture of the subject — the nodes, connections, and hierarchy of ideas.

REQUIRED FORMAT:
## [Central Topic]

### 🔵 [Branch 1: Major Theme]
- **[Sub-node]** — brief definition or key fact
  - [Sub-sub-node if needed]
  - [Sub-sub-node if needed]
- **[Sub-node]** — brief definition or key fact

### 🟢 [Branch 2: Major Theme]
[Continue for 4–7 major branches]

---
## Connection Map
A table or bullet list of explicit connections *between* branches — ideas that span multiple themes.
| Concept A | → Connects to → | Concept B | Mechanism |

## Central Tension
One paragraph identifying the core productive tension or unresolved question that the mind map reveals.

CALIBRATION NOTES:
- Use 4–7 major branches (## level)
- Each branch should have 3–8 sub-nodes
- The Connection Map is mandatory — the most common mind map failure is missing cross-links`,
      userTemplate: (sources: string) =>
        `Generate a Mind Map document from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },

  slide_deck: {
    v1: {
      system: `${ARTIFACT_SYSTEM_BASE}

FORMAT: Slide Deck Script / Outline
PURPOSE: A presentation-ready structure with per-slide content, suitable for exporting to PowerPoint or Keynote.

REQUIRED FORMAT:
---
## Slide [N]: [Slide Title]
**Type:** [Title | Content | Two-Column | Quote | Data | Diagram | Summary]
**Headline:** [The single sentence a viewer reads first — the core claim of this slide]
**Body:**
- Bullet 1 (max 12 words)
- Bullet 2
- Bullet 3 (3–5 bullets max per content slide)
**Speaker Notes:** [2–4 sentences the presenter speaks — adds depth beyond the bullets]
---

DECK STRUCTURE:
- Slide 1: Title slide (title, subtitle, context)
- Slides 2–3: Problem or Context (why this matters)
- Slides 4–8: Core Content (one major idea per slide)
- Slides 9–10: Synthesis and Implications
- Slide 11: Key Takeaway (one sentence, high contrast)
- Slide 12: Q&A / Next Steps

QUALITY RULES:
- Every headline should be an assertion, not a topic label
  ✓ "Three Structural Forces Are Reshaping the Market"
  ✗ "Market Trends"
- Speaker notes must add information not on the slide
- No slide should have more than 5 bullets`,
      userTemplate: (sources: string) =>
        `Generate a Slide Deck outline from the following source material.\n${ARTIFACT_SOURCE_PREFIX}${sources}`,
    },
  },
}

export type ArtifactFormat = 'study_guide' | 'brief' | 'faq' | 'timeline' | 'mind_map' | 'slide_deck'

export function getArtifactPrompt(format: ArtifactFormat) {
  return ARTIFACT_PROMPTS[format].v1
}

export const ARTIFACT_FORMAT_META: Record<ArtifactFormat, {
  label: string
  description: string
  readTime: string
  icon: string
}> = {
  study_guide: {
    label: 'Study Guide',
    description: 'Concepts, key facts, relationships, and review questions for deep learning.',
    readTime: '10–15 min',
    icon: 'book-open',
  },
  brief: {
    label: 'Briefing Doc',
    description: 'Executive summary with findings, analysis, and recommended actions.',
    readTime: '3–5 min',
    icon: 'file-text',
  },
  faq: {
    label: 'FAQ',
    description: 'Every meaningful question a reader would have, authoritatively answered.',
    readTime: '8–12 min',
    icon: 'help-circle',
  },
  timeline: {
    label: 'Timeline',
    description: 'Chronological or causal sequence with pattern analysis.',
    readTime: '5–8 min',
    icon: 'clock',
  },
  mind_map: {
    label: 'Mind Map',
    description: 'Full conceptual architecture: branches, sub-nodes, and cross-connections.',
    readTime: '5–10 min',
    icon: 'git-branch',
  },
  slide_deck: {
    label: 'Slide Deck',
    description: '12-slide presentation-ready outline with headlines and speaker notes.',
    readTime: '5–8 min',
    icon: 'layout',
  },
}


// ═══════════════════════════════════════════════════════════════════════════
// FR-11 — RESPONSE STYLE CUSTOMISATION
// FR-18 — CHAT i18n (35+ LANGUAGES)
// ═══════════════════════════════════════════════════════════════════════════

export type ResponseLength = 'concise' | 'medium' | 'detailed' | 'comprehensive'
export type ResponseFormality = 'casual' | 'neutral' | 'formal' | 'academic'
export type ResponseFormat = 'prose' | 'bullets' | 'structured'

export interface StylePreference {
  length: ResponseLength
  formality: ResponseFormality
  format: ResponseFormat
  language: string // BCP-47 code, e.g. 'en', 'fr', 'ja'
}

export const DEFAULT_STYLE: StylePreference = {
  length: 'medium',
  formality: 'neutral',
  format: 'prose',
  language: 'en',
}

const LENGTH_DIRECTIVES: Record<ResponseLength, string> = {
  concise:      'Keep responses concise — 1–3 short paragraphs maximum. Prioritise the single most important insight.',
  medium:       'Aim for moderate depth — 3–5 paragraphs. Cover the key points without over-explaining.',
  detailed:     'Provide detailed responses — thorough explanation with supporting context, examples, and nuance.',
  comprehensive: 'Be comprehensive — leave nothing important unsaid. Use headers, examples, and structured breakdown where helpful.',
}

const FORMALITY_DIRECTIVES: Record<ResponseFormality, string> = {
  casual:   'Write in a casual, conversational tone. Contractions fine. Keep it friendly and accessible.',
  neutral:  'Use a clear, balanced tone — professional but not stiff. Accessible without being informal.',
  formal:   'Maintain a formal, professional tone throughout. Precise vocabulary. No contractions.',
  academic: 'Use an academic register — rigorous, precise, with explicit reasoning and hedged claims where appropriate.',
}

const FORMAT_DIRECTIVES: Record<ResponseFormat, string> = {
  prose:      'Respond in flowing prose paragraphs. Avoid bullet lists unless comparing discrete items.',
  bullets:    'Structure the response primarily as bullet points and short-form lists for easy scanning.',
  structured: 'Use a structured format with clear section headers, bullet points, and visual hierarchy.',
}

/**
 * Build the style directive block that is appended to RAG system prompts.
 * Called by rag.ts when constructing the finalSystemPrompt.
 */
export function buildStyleDirective(style: StylePreference): string {
  const lengthDir = LENGTH_DIRECTIVES[style.length]
  const formalityDir = FORMALITY_DIRECTIVES[style.formality]
  const formatDir = FORMAT_DIRECTIVES[style.format]

  // FR-18: Language directive
  const langName = CHAT_LANGUAGE_NAMES[style.language] || style.language
  const langDir = style.language !== 'en'
    ? `LANGUAGE: Respond entirely in ${langName}. This applies to all chat responses, not just this one.`
    : ''

  return `
# RESPONSE STYLE PREFERENCES
The user has configured the following preferences for your responses:
LENGTH: ${lengthDir}
FORMALITY: ${formalityDir}
FORMAT: ${formatDir}${langDir ? '\n' + langDir : ''}

Apply these consistently in every response. Do not mention these instructions.`
}

// ── FR-18: CHAT LANGUAGE REGISTRY (35 languages) ────────────────────────────
export const CHAT_LANGUAGES = [
  { code: 'en',    label: 'English' },
  { code: 'es',    label: 'Español' },
  { code: 'fr',    label: 'Français' },
  { code: 'de',    label: 'Deutsch' },
  { code: 'pt',    label: 'Português' },
  { code: 'it',    label: 'Italiano' },
  { code: 'nl',    label: 'Nederlands' },
  { code: 'pl',    label: 'Polski' },
  { code: 'ru',    label: 'Русский' },
  { code: 'ja',    label: '日本語' },
  { code: 'zh',    label: '中文（简体）' },
  { code: 'zh-TW', label: '中文（繁體）' },
  { code: 'ko',    label: '한국어' },
  { code: 'ar',    label: 'العربية' },
  { code: 'hi',    label: 'हिन्दी' },
  { code: 'tr',    label: 'Türkçe' },
  { code: 'sv',    label: 'Svenska' },
  { code: 'da',    label: 'Dansk' },
  { code: 'no',    label: 'Norsk' },
  { code: 'fi',    label: 'Suomi' },
  { code: 'he',    label: 'עברית' },
  { code: 'id',    label: 'Indonesia' },
  { code: 'vi',    label: 'Tiếng Việt' },
  { code: 'th',    label: 'ภาษาไทย' },
  { code: 'uk',    label: 'Українська' },
  { code: 'cs',    label: 'Čeština' },
  { code: 'ro',    label: 'Română' },
  { code: 'hu',    label: 'Magyar' },
  { code: 'el',    label: 'Ελληνικά' },
  { code: 'ms',    label: 'Melayu' },
  { code: 'bg',    label: 'Български' },
  { code: 'hr',    label: 'Hrvatski' },
  { code: 'sk',    label: 'Slovenčina' },
  { code: 'lt',    label: 'Lietuvių' },
  { code: 'lv',    label: 'Latviešu' },
]

export const CHAT_LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(
  CHAT_LANGUAGES.map(l => [l.code, l.label])
)
