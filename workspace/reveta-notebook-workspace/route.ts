{
  "$schema": "https://antigravity.dev/schemas/ai-prompts.json",
  "source": "../lib/ai/prompts.ts",
  "evalHarness": "../lib/ai/__tests__/prompt-evals.ts",
  "evalCommand": "npm run eval",
  "passThreshold": 0.8,
  "pinnedModel": "claude-sonnet-4-20250514",

  "prompts": [
    {
      "id": "audio:deep_dive",
      "format": "deep_dive",
      "category": "audio",
      "accessor": "getAudioPrompt('deep_dive')",
      "version": "v1",
      "description": "Two-host exploratory conversation (ALEX + SAM). 8-12 min, 1200-1800 words. Narrative arc: hook → context → exploration → insight → synthesis.",
      "hosts": ["ALEX", "SAM"],
      "evalSuite": "audio:deep_dive",
      "evalCoverage": 12,
      "evalStatus": "passing",
      "requirement": "FR-05",
      "calledFrom": ["lib/ai/audio-overview.ts"]
    },
    {
      "id": "audio:brief",
      "format": "brief",
      "category": "audio",
      "accessor": "getAudioPrompt('brief')",
      "version": "v1",
      "description": "Single-host dense summary (ALEX). Under 2 min, 200-280 words. Lead → context → evidence → implication → close.",
      "hosts": ["ALEX"],
      "evalSuite": "audio:brief",
      "evalCoverage": 12,
      "evalStatus": "passing",
      "requirement": "FR-05",
      "calledFrom": ["lib/ai/audio-overview.ts"]
    },
    {
      "id": "audio:critique",
      "format": "critique",
      "category": "audio",
      "accessor": "getAudioPrompt('critique')",
      "version": "v1",
      "description": "Two-host critical analysis (ALEX defends, SAM challenges). 6-10 min. Academic but energetic.",
      "hosts": ["ALEX", "SAM"],
      "evalSuite": "audio:critique",
      "evalCoverage": 12,
      "evalStatus": "passing",
      "requirement": "FR-05",
      "calledFrom": ["lib/ai/audio-overview.ts"]
    },
    {
      "id": "audio:debate",
      "format": "debate",
      "category": "audio",
      "accessor": "getAudioPrompt('debate')",
      "version": "v1",
      "description": "Two-host adversarial debate derived from source tensions. 8-12 min. Neither host wins decisively.",
      "hosts": ["ALEX", "SAM"],
      "evalSuite": "audio:debate",
      "evalCoverage": 12,
      "evalStatus": "passing",
      "requirement": "FR-05",
      "calledFrom": ["lib/ai/audio-overview.ts"]
    },
    {
      "id": "audio:lecture",
      "format": "lecture",
      "category": "audio",
      "accessor": "getAudioPrompt('lecture')",
      "version": "v1",
      "description": "Single-host university lecture (ALEX). 25-35 min, 3750-5250 words. Intro → 3 concepts → synthesis → implications → close.",
      "hosts": ["ALEX"],
      "evalSuite": "audio:lecture",
      "evalCoverage": 12,
      "evalStatus": "passing",
      "requirement": "FR-05",
      "calledFrom": ["lib/ai/audio-overview.ts"]
    },
    {
      "id": "artifact:study_guide",
      "format": "study_guide",
      "category": "artifact",
      "accessor": "getArtifactPrompt('study_guide')",
      "version": "v1",
      "description": "Structured study guide with key concepts, definitions, and review questions from source material.",
      "evalSuite": "artifact:study_guide",
      "evalCoverage": 10,
      "evalStatus": "passing",
      "requirement": "FR-09",
      "calledFrom": ["lib/ai/artifact-generator.ts"]
    },
    {
      "id": "artifact:brief",
      "format": "brief",
      "category": "artifact",
      "accessor": "getArtifactPrompt('brief')",
      "version": "v1",
      "description": "Concise written summary of source material — executive brief format.",
      "evalSuite": "artifact:brief",
      "evalCoverage": 10,
      "evalStatus": "passing",
      "requirement": "FR-09",
      "calledFrom": ["lib/ai/artifact-generator.ts"]
    },
    {
      "id": "artifact:faq",
      "format": "faq",
      "category": "artifact",
      "accessor": "getArtifactPrompt('faq')",
      "version": "v1",
      "description": "FAQ document derived from source material — questions and answers format.",
      "evalSuite": "artifact:faq",
      "evalCoverage": 10,
      "evalStatus": "passing",
      "requirement": "FR-09",
      "calledFrom": ["lib/ai/artifact-generator.ts"]
    },
    {
      "id": "artifact:timeline",
      "format": "timeline",
      "category": "artifact",
      "accessor": "getArtifactPrompt('timeline')",
      "version": "v1",
      "description": "Chronological timeline of events, dates, and milestones from source material.",
      "evalSuite": "artifact:timeline",
      "evalCoverage": 10,
      "evalStatus": "passing",
      "requirement": "FR-09",
      "calledFrom": ["lib/ai/artifact-generator.ts"]
    },
    {
      "id": "artifact:mind_map",
      "format": "mind_map",
      "category": "artifact",
      "accessor": "getArtifactPrompt('mind_map')",
      "version": "v1",
      "description": "Concept map with nodes, branches, and relationships from source material. Supports FR-17 source scoping.",
      "fr17ScopingSupported": true,
      "evalSuite": "artifact:mind_map",
      "evalCoverage": 10,
      "evalStatus": "passing",
      "requirement": "FR-09, FR-17",
      "calledFrom": ["lib/ai/artifact-generator.ts"]
    },
    {
      "id": "artifact:slide_deck",
      "format": "slide_deck",
      "category": "artifact",
      "accessor": "getArtifactPrompt('slide_deck')",
      "version": "v1",
      "description": "Presentation slide deck outline with title slides, section headers, and bullet points.",
      "evalSuite": "artifact:slide_deck",
      "evalCoverage": 10,
      "evalStatus": "passing",
      "requirement": "FR-09",
      "calledFrom": ["lib/ai/artifact-generator.ts"]
    },
    {
      "id": "rag:system",
      "category": "rag",
      "description": "Core RAG system prompt — strict source-grounding, inline citations [Source: ChunkID], injection defence, neutral synthesizer role.",
      "location": "lib/ai/rag.ts:RAG_SYSTEM_PROMPT",
      "styleDirectiveInjected": true,
      "fr15ScopingSupported": true,
      "fr18LanguageSupported": true,
      "evalSuite": "rag:system",
      "evalCoverage": 10,
      "evalStatus": "passing",
      "requirement": "FR-01, FR-02, FR-11, FR-15, FR-18",
      "calledFrom": ["lib/ai/rag.ts:executeRAGQuery"]
    }
  ],

  "supportingSystems": {
    "styleDirective": {
      "id": "style:directive",
      "description": "buildStyleDirective() appends response style preferences (length/formality/format/language) to RAG system prompt.",
      "source": "lib/ai/prompts.ts:buildStyleDirective",
      "evalSuite": "style:directive",
      "evalCoverage": 10,
      "requirement": "FR-11, FR-18"
    },
    "promptInjectionAudit": {
      "id": "security:injection",
      "description": "Cross-prompt injection surface audit — no API keys, no system-override language, static system strings.",
      "evalSuite": "security:injection",
      "evalCoverage": 10
    },
    "formatContracts": {
      "id": "format:contracts",
      "description": "Format contract verification — host assignments, word count bounds, unique system prompts per format.",
      "evalSuite": "format:contracts",
      "evalCoverage": 10
    }
  }
}
