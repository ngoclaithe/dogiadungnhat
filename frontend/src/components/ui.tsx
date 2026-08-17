import Link from "next/link";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  href,
  action = "Xem tất cả",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl text-ink sm:text-4xl">{title}</h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="text-sm font-medium text-matcha underline-offset-4 hover:underline"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}
