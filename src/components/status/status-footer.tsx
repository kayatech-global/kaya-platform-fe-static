import Link from "next/link";

export function StatusFooter() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-4 py-8 text-sm text-gray-500 dark:text-gray-400 sm:flex-row sm:justify-between">
        <div className="flex gap-4">
          <Link
            href="/status"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Status
          </Link>
          <Link
            href="/status/history"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Incident History
          </Link>
          <Link
            href="/status/subscribe"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Subscribe
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Kaya Technologies. All rights reserved.</p>
      </div>
    </footer>
  );
}
