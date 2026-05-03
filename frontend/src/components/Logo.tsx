import { Link } from "wouter";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = size === "lg" ? 28 : size === "sm" ? 18 : 22;
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
    >
      <span
        className="grid place-items-center rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground"
        style={{ width: px + 8, height: px + 8 }}
      >
        <svg
          width={px - 4}
          height={px - 4}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="8 6 2 12 8 18" />
          <polyline points="16 6 22 12 16 18" />
        </svg>
      </span>
      <span className={size === "lg" ? "text-xl" : "text-base"}>
        Code<span className="text-gradient">Source</span>
      </span>
    </Link>
  );
}
