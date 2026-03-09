export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-page">
      <main className="flex flex-col gap-8 items-center max-w-2xl text-center">
        <h1 className="reveta-hero text-text-primary">
          Reveta Notebook
        </h1>
        <p className="reveta-body text-text-secondary">
          Advanced Agentic Coding Environment. System substrate initialized.
        </p>
        <div className="flex gap-4 mt-4">
          <a
            className="rounded-component bg-interactive-primary hover:bg-interactive-primary-hover text-text-inverse transition-colors reveta-body font-medium h-12 px-6 flex items-center justify-center shadow-lift"
            href="/login"
          >
            Authenticate
          </a>
        </div>
      </main>

      <footer className="absolute bottom-8 text-center w-full">
        <a href="/privacy" className="reveta-label text-text-tertiary hover:text-text-primary transition-colors">
          Privacy Policy & Data Uses
        </a>
      </footer>
    </div>
  );
}
