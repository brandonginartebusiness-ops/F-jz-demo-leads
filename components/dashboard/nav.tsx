import Link from "next/link";

type DashboardNavProps = {
  currentPath:
    | "/dashboard"
    | "/dashboard/setup"
    | "/dashboard/icp"
    | "/dashboard/analytics"
    | "/dashboard/activity"
    | "/dashboard/intelligence";
  showSetupWarning: boolean;
};

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Setup", href: "/dashboard/setup" },
  { label: "ICP Builder", href: "/dashboard/icp" },
  { label: "Activity", href: "/dashboard/activity" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Intelligence", href: "/dashboard/intelligence" },
] as const;

export function DashboardNav({
  currentPath,
  showSetupWarning,
}: DashboardNavProps) {
  return (
    <nav aria-label="Dashboard navigation" className="flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive = currentPath === link.href;

        return (
          <Link
            key={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-accent text-white shadow-lg shadow-accent/20"
                : "border border-stroke text-sand hover:border-sand/30 hover:text-sand-bright hover:bg-bg-soft"
            }`}
            href={link.href}
          >
            <span className="font-body tracking-wide">{link.label}</span>
            {link.href === "/dashboard/setup" && showSetupWarning ? (
              <span
                aria-label="Needs setup"
                className="h-2 w-2 rounded-full bg-amber animate-pulse"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
