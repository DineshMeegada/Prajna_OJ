interface Segment {
  type: "heading" | "subHeading" | "bullet" | "text" | "spacer";
  content: string;
}

function classifyLine(line: string): Segment {
  const trimmed = line.trim();
  if (!trimmed) {
    return { type: "spacer", content: "" };
  }

  if (/^(example|constraints|follow-up|input format|output format)/i.test(trimmed)) {
    return { type: "heading", content: trimmed };
  }

  if (/^(input|output|explanation)/i.test(trimmed)) {
    return { type: "subHeading", content: trimmed };
  }

  if (/^[-•]/.test(trimmed)) {
    return { type: "bullet", content: trimmed.replace(/^[-•]\s*/, "") };
  }

  return { type: "text", content: trimmed };
}

interface Props {
  statement: string;
}

export function StatementRenderer({ statement }: Props) {
  const segments = statement.split("\n").map(classifyLine);

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {segments.map((segment, index) => {
        if (segment.type === "spacer") {
          return <div key={`spacer-${index}`} className="h-2" />;
        }

        if (segment.type === "heading") {
          return (
            <p
              key={`heading-${index}`}
              className="text-base font-semibold uppercase tracking-wide text-white"
            >
              {segment.content}
            </p>
          );
        }

        if (segment.type === "subHeading") {
          const [label, rest] = segment.content.split(":");
          return (
            <p key={`sub-${index}`} className="font-semibold text-accent">
              <span className="text-white">{label}:</span>{" "}
              <span className="text-white/80">{rest?.trim()}</span>
            </p>
          );
        }

        if (segment.type === "bullet") {
          return (
            <p key={`bullet-${index}`} className="pl-4 text-white/80">
              • {segment.content}
            </p>
          );
        }

        return (
          <p key={`text-${index}`} className="text-white/80">
            {segment.content}
          </p>
        );
      })}
    </div>
  );
}

