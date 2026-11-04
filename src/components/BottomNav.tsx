"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, ListTodo, ShoppingCart } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { href: "/", label: "Dieta", icon: UtensilsCrossed },
  { href: "/rotina", label: "Rotina", icon: ListTodo },
  { href: "/compras", label: "Compras", icon: ShoppingCart },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="sticky bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)] z-40">
      <div className="max-w-md mx-auto flex items-stretch">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
            >
              <div
                className={clsx(
                  "w-11 h-8 rounded-full flex items-center justify-center transition-colors",
                  active ? "bg-accent-soft text-accent" : "text-foreground-muted"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              </div>
              <span
                className={clsx(
                  "text-[11px] font-medium",
                  active ? "text-accent" : "text-foreground-muted"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
