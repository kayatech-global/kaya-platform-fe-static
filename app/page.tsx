export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold tracking-tight text-balance">
        Welcome to your v0 App
      </h1>
      <p className="text-muted-foreground text-center text-pretty max-w-md">
        Your Vercel-linked project is ready. Start building by editing{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono">
          app/page.tsx
        </code>
        .
      </p>
    </main>
  );
}
