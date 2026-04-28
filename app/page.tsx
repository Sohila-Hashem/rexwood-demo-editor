import Editor from "@/components/Editor";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Rexwood Mandates Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">Rich text editor with live HTML &amp; JSON preview</p>
        </div>
        <Editor />
      </div>
    </main>
  );
}
