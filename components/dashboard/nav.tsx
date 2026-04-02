import Link from "next/link";

type DashboardNavProps = {
  currentPath:
    | "/dashboard"
    | "/dashboard/setup"
    | "/dashboard/icp"
    | "/dashboard/analytics"
    | "/dashboard/activity";
  showSetupWarning: boolean;
};

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Setup", href: "/dashboard/setup" },
  { label: "ICP Builder", href: "/dashboard/icp" },
  { label: "Activity", href: "/dashboard/activity" },
  { label: "Analytics", href: "/dashboard/analytics" },
] as const;

export function DashboardNav({
  currentPath,
  showSetupWarning,
}: DashboardNavProps) {
  return (
    <nav aria-label="Dashboard navigation" className="flex flex-wrap gap-3">
      {links.map((link) => {
        const isActive = currentPath === link.href;

        return (
          <Link
            key={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-accent bg-accent-muted text-accent"
                : "border-border bg-panel text-silver hover:border-accent"
            }`}
            href={link.href}
          >
            <span>{link.label}</span>
            {link.href === "/dashboard/setup" && showSetupWarning ? (
              <span aria-label="Needs setup" className="h-2.5 w-2.5 rounded-full bg-accent-hover" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
