import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Flame } from "lucide-react";
import Link from "next/link";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { roleLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Hack2Fire",
  description: "Role-based interview question bank, coding practice, video lessons, and contribution workflows."
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand" aria-label="Hack2Fire home">
            <span className="brand-mark"><Flame size={20} /></span>
            <span>Hack2Fire</span>
          </Link>
          <nav className="nav-links" aria-label="Primary">
            <Link href="/questions">Questions</Link>
            <Link href="/companies">Companies</Link>
            <Link href="/dashboard">Dashboard</Link>
            {user?.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
          </nav>
          <div className="account-area">
            {user ? (
              <>
                <span className="role-pill">{roleLabel(user.role)}</span>
                <form action={logoutAction}>
                  <button className="ghost-button" type="submit">Log out</button>
                </form>
              </>
            ) : (
              <Link className="primary-button small" href="/login">Log in</Link>
            )}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
