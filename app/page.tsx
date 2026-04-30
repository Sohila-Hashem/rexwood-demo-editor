import Editor from "@/components/Editor";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center pt-20 pb-12 px-4 bg-gray-200 w-full">
      <div className="w-full max-w-3xl">
        <Editor />
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Rexwood Capital. All rights reserved.
      </footer>
    </main>
  );
}
