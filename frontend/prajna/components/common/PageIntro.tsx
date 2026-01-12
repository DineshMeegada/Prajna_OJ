interface Props {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function PageIntro({ eyebrow, title, description, actions }: Props) {
  return (
    <section className="mb-10 rounded-3xl border border-white/5 bg-panel p-8 shadow-[var(--shadow-card)]">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          {eyebrow}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            {title}
          </h1>
          <p className="text-base text-white/70">{description}</p>
        </div>
        {actions}
      </div>
    </section>
  );
}

