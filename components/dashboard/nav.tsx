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
    <nav className="flex flex-wrap gap-3">
      {links.map((link) => {
        const isActive = currentPath === link.href;

        return (
          <Link
            key={link.href}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-[#FF6B00] bg-[#FF6B00]/12 text-[#FF6B00]"
                : "border-[#FF6B00]/25 bg-[#1a1a1a] text-[#C0C0C0] hover:border-[#FF6B00]"
            }`}
            href={link.href}
          >
            <span>{link.label}</span>
            {link.href === "/dashboard/setup" && showSetupWarning ? (
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF8C00]" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
