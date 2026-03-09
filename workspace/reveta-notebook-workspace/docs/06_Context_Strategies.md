# Reveta Notebook — Context Engineering Architectures (Tier -1)

This document satisfies the **CTX-STRATEGIES** requirement, defining the `WRITE`, `SELECT` (Retrieval), `COMPRESS`, and `ISOLATE` paradigms for every AI feature before Tier 1 implementation begins.

---

## 1. Chat & Scoped Queries (FR-01 / FR-15)
*Users querying notebook sources with strict provenance and optional scope.*

* **WRITE (Prompt Architecture)**
  * **System**: "You are NotebookLM. Answer the user strictly using the provided sources. Do not use external knowledge. If the answer is not in the sources, say so. Cite every claim using `[Source X, pg Y]`."
  * **Input**: User query + Conversation history (last 5 turns) + Retrieved chunks.
* **SELECT (Retrieval Strategy)**
  * **Vector Search**: top-k chunks filtering by `notebook_id` and (if scoped via FR-15) specific `source_ids`. 
  * **Hybrid Search**: Semantic + keyword cross-matching.
* **COMPRESS (Context Management)**
  * **History Truncation**: Keep only the last 5 Q&A turns.
  * **Source Snippets**: Truncate returned source chunks to 300 tokens each with 50-token overlap padding.
* **ISOLATE (Mitigation)**
  * Pre-prompt injection defense: Explicit system bounds denying action-execution or persona shifts.

---

## 2. Audio Overview Generation (FR-05)
*Generating Deep Dive, Brief, Critique, Debate, and Lecture audio scripts from sources.*

* **WRITE (Prompt Architecture)**
  * **System**: "You are an expert audio scriptwriter and podcast host. Generate a script in exactly the specified format and language. Speakers must alternate naturally."
  * **Format**: Defined JSON schema for script arrays containing `{"speaker": "A", "text": "..."}`.
* **SELECT (Retrieval Strategy)**
  * **Synthesis**: Entire source text (or hierarchical summarization if > 100k tokens).
  * No vector retrieval; full context ingestion where parameter limits allow.
* **COMPRESS (Context Management)**
  * **Map-Reduce Summary**: If sources exceed 150k tokens, run a pre-compression summarization pass extracting key arguments, facts, and themes before script writing.
* **ISOLATE (Mitigation)**
  * Style-drift prevention via strict formatting shots (1-shot example included in prompt).

---

## 3. Interactive Audio Q&A (FR-07)
*Real-time voice queries joining an active audio playback session.*

* **WRITE (Prompt Architecture)**
  * **System**: "You are the hosts of the audio session currently playing. The user just interrupted to ask a question. Respond briefly (under 15 seconds speaking time) and organically transition back to the script topic."
* **SELECT (Retrieval Strategy)**
  * **Context**: Current playing audio script segment + top-2 source chunks relevant to the user's interruption.
* **COMPRESS (Context Management)**
  * Only the immediately preceding 60 seconds of transcript are passed to the model.
* **ISOLATE (Mitigation)**
  * Latency constraint requires extremely short prompt payload. Streaming generation required.

---

## 4. Studio Output Generation (FR-09 / FR-17)
*Generating static formats like Mind Maps, FAQs, and Study Guides.*

* **WRITE (Prompt Architecture)**
  * **System**: "You are an analytical structuring engine. Extract facts into the requested format (e.g., Markdown table for Study Guide, Mermaid.js for Mind Map)."
* **SELECT (Retrieval Strategy)**
  * Entire relevant source context (scoped via FR-17 if applicable).
* **COMPRESS (Context Management)**
  * Hierarchical extraction for Mind Maps (Topic -> Subtopic -> Fact) to enforce concise leaf nodes.
* **ISOLATE (Mitigation)**
  * Output schema strictly enforced via tool-calling or constrained JSON generation to prevent format corruption.
