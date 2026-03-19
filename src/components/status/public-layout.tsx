import type { ReactNode } from "react";
import { StatusHeader } from "./status-header";
import { StatusFooter } from "./status-footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <StatusHeader />
      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8">
        {children}
      </main>
      <StatusFooter />
    </div>
  );
}
