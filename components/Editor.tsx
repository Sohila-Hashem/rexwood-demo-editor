'use client'

import { useEditor, EditorContent, type Editor as TipTapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef, useState } from 'react'
import { FileTextIcon, DownloadIcon, Loader2Icon, PanelRightIcon, SlidersHorizontalIcon } from 'lucide-react'
import { createTokenExtension } from '@/components/TokenExtension'
import { TokenDropdown } from '@/components/TokenDropdown'
import { MOCK_TOKENS, type TokenMap } from '@/lib/tokens'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

type PreviewTab = 'html' | 'json'

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center h-8 min-w-8 px-2 rounded text-sm
        transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${active
          ? 'bg-foreground text-background'
          : 'bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground'}
      `}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-border self-center mx-0.5" />
}

function ToolbarButtons({
  editor,
  tokens,
  dir,
  onDirToggle,
}: {
  editor: TipTapEditor | null
  tokens: TokenMap
  dir: 'ltr' | 'rtl'
  onDirToggle: () => void
}) {
  return (
    <>
      <ToolbarButton title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')}>
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton title="Code" onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')}>
        {'<>'}
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Heading 1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })}>H1</ToolbarButton>
      <ToolbarButton title="Heading 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })}>H2</ToolbarButton>
      <ToolbarButton title="Heading 3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })}>H3</ToolbarButton>

      <Divider />

      <ToolbarButton title="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton title="Ordered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
          <path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton title="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton title="Code block" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Horizontal rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6"/><path d="M3 13C5.5 7.5 11 5 17 7s9 8 6 14"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6"/><path d="M21 13C18.5 7.5 13 5 7 7s-9 8-6 14"/>
        </svg>
      </ToolbarButton>

      <Divider />

      <TokenDropdown editor={editor} tokens={tokens} />

      <Divider />

      <ToolbarButton
        title={dir === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'}
        onClick={onDirToggle}
        active={dir === 'rtl'}
      >
        {dir === 'ltr' ? 'RTL' : 'LTR'}
      </ToolbarButton>
    </>
  )
}

export default function Editor() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('html')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sheetHeight, setSheetHeight] = useState(60) // vh
  const [tokens, setTokens] = useState<TokenMap>({})
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr')
  const [toolbarOpen, setToolbarOpen] = useState(false)

  const tokensRef = useRef<TokenMap>({})

  useEffect(() => {
    tokensRef.current = MOCK_TOKENS
    setTokens(MOCK_TOKENS)
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tokenExtension = useRef(createTokenExtension(tokensRef)).current

  const editor = useEditor({
    extensions: [StarterKit, tokenExtension, Placeholder.configure({ placeholder: 'Start writing your document…' })],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[297mm] min-w-full px-5 py-4 prose prose-sm sm:prose max-w-none',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.view.dom.setAttribute('dir', dir)
  }, [editor, dir])

  // PDF generation state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const pdfBlobRef = useRef<string | null>(null)

  useEffect(() => {
    return () => { if (pdfBlobRef.current) URL.revokeObjectURL(pdfBlobRef.current) }
  }, [])

  async function generatePdf() {
    if (!editor) return
    if (editor.isEmpty) {
      setPdfError('The document is empty. Add some content before generating a PDF.')
      setPdfModalOpen(true)
      return
    }
    if (pdfBlobRef.current) {
      URL.revokeObjectURL(pdfBlobRef.current)
      pdfBlobRef.current = null
    }
    setPdfLoading(true)
    setPdfError(null)
    setPdfUrl(null)
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editor.getJSON() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'PDF generation failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      pdfBlobRef.current = url
      setPdfUrl(url)
      setPdfModalOpen(true)
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Unknown error')
      setPdfModalOpen(true)
    } finally {
      setPdfLoading(false)
    }
  }

  const [html, setHtml] = useState('')
  const [json, setJson] = useState('')
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    if (!editor) return
    const update = () => {
      setHtml(editor.getHTML())
      setJson(JSON.stringify(editor.getJSON(), null, 2))
      setIsEmpty(editor.isEmpty)
    }
    update()
    editor.on('update', update)
    return () => { editor.off('update', update) }
  }, [editor])

  return (
    <div className="flex flex-col sm:gap-6">
      {/* Sticky full-width toolbar — desktop only */}
      <div className="hidden sm:flex fixed top-0 left-0 right-0 z-50 items-center gap-1 px-4 py-2 border-b border-border bg-muted/95 backdrop-blur-sm flex-wrap shadow-sm">
        <ToolbarButtons
          editor={editor}
          tokens={tokens}
          dir={dir}
          onDirToggle={() => setDir(d => d === 'ltr' ? 'rtl' : 'ltr')}
        />
        {/* Push actions to the right */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-sm"
            onClick={() => setPreviewOpen(true)}
          >
            <PanelRightIcon className="size-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-sm"
            onClick={generatePdf}
            disabled={pdfLoading || isEmpty}
          >
            {pdfLoading
              ? <Loader2Icon className="size-3.5 animate-spin" />
              : <FileTextIcon className="size-3.5" />}
            {pdfLoading ? 'Generating…' : 'Generate PDF'}
          </Button>
        </div>
      </div>

      {/* FAKE toolbar placeholder — desktop only, reserves space so content isn't hidden under fixed bar */}
      <div className="hidden sm:block h-2 shrink-0" />

      {/* Mobile bottom toolbar sheet */}
      <Sheet open={toolbarOpen} onOpenChange={setToolbarOpen}>
        <SheetContent side="bottom" className="sm:hidden flex flex-col p-0 gap-0">
          <SheetHeader className="px-4 py-2 border-b border-border shrink-0">
            <SheetTitle className="text-sm font-semibold">Formatting</SheetTitle>
          </SheetHeader>
          <div className="flex flex-wrap gap-1.5 p-4">
            <ToolbarButtons
              editor={editor}
              tokens={tokens}
              dir={dir}
              onDirToggle={() => setDir(d => d === 'ltr' ? 'rtl' : 'ltr')}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile fixed bottom action bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 px-4 py-2 border-t border-border bg-muted/95 backdrop-blur-sm shadow-sm">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-sm"
          onClick={() => setToolbarOpen(true)}
        >
          <SlidersHorizontalIcon className="size-3.5" />
          Format
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-sm"
          onClick={() => setPreviewOpen(true)}
        >
          <PanelRightIcon className="size-3.5" />
          Preview
        </Button>
        <Button
          size="sm"
          className="h-9 gap-1.5 text-sm ml-auto"
          onClick={generatePdf}
          disabled={pdfLoading || isEmpty}
        >
          {pdfLoading
            ? <Loader2Icon className="size-3.5 animate-spin" />
            : <FileTextIcon className="size-3.5" />}
          {pdfLoading ? 'Generating…' : 'Generate PDF'}
        </Button>
      </div>

      {/* Spacer so content isn't hidden under mobile bottom bar */}
      <div className="sm:hidden h-14 shrink-0" />

      {/* Editor card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Preview bottom sheet */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent
          side="bottom"
          style={{ height: `${sheetHeight}vh` }}
          className="flex flex-col p-0 gap-0 overflow-hidden transition-none"
        >
          {/* Drag handle */}
          <div
            className="flex justify-center pt-2 pb-1 cursor-ns-resize shrink-0 select-none"
            onPointerDown={(e) => {
              e.preventDefault()
              const startY = e.clientY
              const startHeight = sheetHeight
              const onMove = (ev: PointerEvent) => {
                const deltaVh = ((startY - ev.clientY) / window.innerHeight) * 100
                setSheetHeight(Math.min(90, Math.max(20, startHeight + deltaVh)))
              }
              const onUp = () => {
                window.removeEventListener('pointermove', onMove)
                window.removeEventListener('pointerup', onUp)
              }
              window.addEventListener('pointermove', onMove)
              window.addEventListener('pointerup', onUp)
            }}
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          <SheetHeader className="px-4 py-2 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-semibold">Live Preview</SheetTitle>
              <div className="flex gap-1 mr-7">
                {(['html', 'json'] as PreviewTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide transition-colors
                      ${activeTab === tab
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </SheetHeader>
          <pre className="flex-1 overflow-auto text-xs leading-relaxed p-4 bg-secondary text-secondary-foreground font-mono">
            {activeTab === 'html' ? html : json}
          </pre>
        </SheetContent>
      </Sheet>

      {/* PDF result modal */}
      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={pdfError ? 'text-destructive' : undefined}>
              {pdfError ? 'Generation failed' : 'PDF ready'}
            </DialogTitle>
            <DialogDescription>
              {pdfError
                ? pdfError
                : 'Your document has been generated successfully.'}
            </DialogDescription>
          </DialogHeader>
          {pdfUrl && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors"
              >
                <FileTextIcon className="size-3.5" />
                Preview
              </a>
              <a
                href={pdfUrl}
                download="document.pdf"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <DownloadIcon className="size-3.5" />
                Download
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

