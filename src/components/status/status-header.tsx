"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export function StatusHeader() {
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="mx-auto flex max-w-[900px] items-center justify-between px-4 py-4">
        <Link href="/status" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <span className="text-sm font-bold text-white">K</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Kaya iFlow
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Status
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDark}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link href="/status/subscribe">
            <Button variant="secondary" size="sm" leadingIcon={<Bell size={14} />}>
              Subscribe to Updates
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
