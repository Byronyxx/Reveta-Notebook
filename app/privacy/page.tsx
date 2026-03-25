export default function PrivacyPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-reveta-8 bg-page text-text-primary">
            <main className="max-w-2xl w-full">
                <h1 className="reveta-h1 mb-reveta-5">Privacy Policy</h1>

                <section className="mb-reveta-5">
                    <h2 className="reveta-h3 mb-reveta-3">Data We Collect</h2>
                    <p className="reveta-body text-text-secondary mb-reveta-3">
                        Reveta Notebook collects the minimum data necessary to provide our service:
                    </p>
                    <ul className="list-disc pl-reveta-4 reveta-body text-text-secondary space-y-reveta-2">
                        <li>Account information (email, display name) via Google OAuth</li>
                        <li>Documents and sources you upload to your notebooks</li>
                        <li>Chat history within your notebooks</li>
                        <li>Generated audio overviews and artifacts</li>
                    </ul>
                </section>

                <section className="mb-reveta-5">
                    <h2 className="reveta-h3 mb-reveta-3">How We Use Your Data</h2>
                    <p className="reveta-body text-text-secondary">
                        Your data is used solely to provide and improve Reveta Notebook.
                        We do not sell your data to third parties. Documents you upload
                        are processed by AI models (Anthropic Claude, OpenAI) to enable
                        RAG-powered chat and audio overview generation.
                    </p>
                </section>

                <section className="mb-reveta-5">
                    <h2 className="reveta-h3 mb-reveta-3">Data Retention</h2>
                    <p className="reveta-body text-text-secondary">
                        You can delete your notebooks, sources, and account at any time.
                        Deleted data is removed from our systems within 30 days.
                    </p>
                </section>

                <section className="mb-reveta-5">
                    <h2 className="reveta-h3 mb-reveta-3">Third-Party Services</h2>
                    <p className="reveta-body text-text-secondary">
                        We use Supabase (database), Anthropic (AI), OpenAI (embeddings + TTS),
                        and Vercel (hosting). Each has their own privacy policies.
                    </p>
                </section>

                <a href="/" className="reveta-label text-text-tertiary hover:text-text-primary transition-colors">
                    ← Back to Home
                </a>
            </main>
        </div>
    )
}
