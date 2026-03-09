export default function PrivacyPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-reveta-8 bg-page text-text-primary">
            <main className="flex flex-col gap-reveta-6 max-w-2xl text-left bg-card p-reveta-8 rounded-large border border-border-default shadow-ground">
                <h1 className="reveta-h1 border-b border-border-default pb-reveta-4 font-display">Privacy & Data Governance</h1>

                <section className="space-y-reveta-3">
                    <h2 className="reveta-h3 text-interactive-primary">1. No Model Training (FR-14 Guarantee)</h2>
                    <p className="reveta-body text-text-secondary">
                        <strong>User-uploaded sources and generated content are NEVER used to train any AI models.</strong> We enforce this standard technically, not just via policy. This is the core data contract of the Reveta Notebook product.
                    </p>
                </section>

                <section className="space-y-reveta-3">
                    <h2 className="reveta-h3 text-interactive-primary">2. Data Isolation & Storage</h2>
                    <p className="reveta-body text-text-secondary">
                        Your notebooks and uploaded source documents are stored in strictly isolated databases. Row-Level Security (RLS) ensures that only your authenticated user account can ever read or write your notebook's data.
                    </p>
                </section>

                <section className="space-y-reveta-3">
                    <h2 className="reveta-h3 text-interactive-primary">3. AI Service Providers</h2>
                    <p className="reveta-body text-text-secondary">
                        Reveta uses the Anthropic Claude API (Option A) for inference. Anthropic explicitly does not use data transmitted via its API for model training. The data exists only for the millisecond duration necessary to generate your response.
                    </p>
                </section>

                <section className="space-y-reveta-3">
                    <h2 className="reveta-h3 text-interactive-primary">4. Data Retention & Deletion Rights</h2>
                    <p className="reveta-body text-text-secondary">
                        You have full control to permanently delete any notebook, source, or message at any time. When deleted from the interface, it is permanently wiped from the active storage nodes.
                    </p>
                </section>

                <a href="/" className="inline-block mt-reveta-4 text-interactive-primary hover:text-interactive-primary-hover reveta-label">
                    &larr; Return to Application
                </a>
            </main>
        </div>
    )
}
