import { NavLink, type NavLinkProps } from "react-router-dom";
import { type ReactNode } from "react";
import { WalletButton } from "./WalletButton";

const navLinkClass: NavLinkProps["className"] = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${
    isActive
      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <NavLink to="/" className="text-lg font-bold text-slate-900 dark:text-slate-100">
            TrueTix
          </NavLink>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Event
            </NavLink>
            <NavLink to="/organizer" className={navLinkClass}>
              Organizer
            </NavLink>
            <NavLink to="/scanner" className={navLinkClass}>
              Scanner
            </NavLink>
            <WalletButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
