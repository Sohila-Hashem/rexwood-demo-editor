'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef, useState } from 'react'
import { FileTextIcon, DownloadIcon, Loader2Icon, Maximize2Icon, Minimize2Icon } from 'lucide-react'
import { createTokenExtension } from '@/components/TokenExtension'
import { TokenDropdown } from '@/components/TokenDropdown'
import { MOCK_TOKENS, type TokenMap } from '@/lib/tokens'
import { Button } from '@/components/ui/button'

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
        inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded text-sm
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

export default function Editor() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('html')
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false)
  const [tokens, setTokens] = useState<TokenMap>({})

  // Keep a ref so the extension closures always see the latest token map
  const tokensRef = useRef<TokenMap>({})

  // Simulate API fetch — replace with: fetch('/api/tokens').then(r => r.json()).then(setTokens)
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
        class: 'outline-none min-h-[200px] px-5 py-4 prose prose-sm sm:prose max-w-none',
      },
    },
  })

  // PDF generation state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const pdfBlobRef = useRef<string | null>(null)

  // Revoke blob URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => { if (pdfBlobRef.current) URL.revokeObjectURL(pdfBlobRef.current) }
  }, [])

  async function generatePdf() {
    if (!editor) return

    // Client-side validation
    if (editor.isEmpty) {
      setPdfError('The document is empty. Add some content before generating a PDF.')
      return
    }

    // Revoke previous blob URL
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
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setPdfLoading(false)
    }
  }

  // Subscribe to editor content changes for live preview + isEmpty tracking
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
    <div className="flex flex-col gap-6">
      {/* Editor card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted flex-wrap">
          <ToolbarButton
            title="Bold"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold')}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic')}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            title="Strikethrough"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive('strike')}
          >
            <s>S</s>
          </ToolbarButton>
          <ToolbarButton
            title="Code"
            onClick={() => editor?.chain().focus().toggleCode().run()}
            active={editor?.isActive('code')}
          >
            {'<>'}
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            title="Heading 1"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor?.isActive('heading', { level: 1 })}
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            title="Heading 2"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive('heading', { level: 2 })}
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            title="Heading 3"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor?.isActive('heading', { level: 3 })}
          >
            H3
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            title="Bullet list"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive('bulletList')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            title="Ordered list"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive('orderedList')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
              <path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            title="Blockquote"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive('blockquote')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            title="Code block"
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            active={editor?.isActive('codeBlock')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            title="Horizontal rule"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            title="Undo"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6"/><path d="M3 13C5.5 7.5 11 5 17 7s9 8 6 14"/>
            </svg>
          </ToolbarButton>
          <ToolbarButton
            title="Redo"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6"/><path d="M21 13C18.5 7.5 13 5 7 7s-9 8-6 14"/>
            </svg>
          </ToolbarButton>

          <Divider />

          <TokenDropdown editor={editor} tokens={tokens} />
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} />
      </div>

      {/* Generate PDF action row */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {isEmpty
            ? 'Add content to the editor to generate a PDF.'
            : 'Your document is ready to be exported.'}
        </p>
        <Button
          size="default"
          className="gap-2 shrink-0"
          onClick={generatePdf}
          disabled={pdfLoading || isEmpty}
        >
          {pdfLoading
            ? <Loader2Icon className="size-4 animate-spin" />
            : <FileTextIcon className="size-4" />}
          {pdfLoading ? 'Generating…' : 'Generate PDF'}
        </Button>
      </div>

      {/* PDF result */}
      {(pdfUrl || pdfError) && (
        <div className={`rounded-xl border px-5 py-4 flex items-center justify-between gap-4 ${
          pdfError
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'border-primary/30 bg-primary/10 text-foreground'
        }`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileTextIcon className="size-4 shrink-0" />
            {pdfError ? pdfError : 'PDF generated successfully'}
          </div>
          {pdfUrl && (
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2 hover:opacity-80"
              >
                Preview
              </a>
              <a
                href={pdfUrl}
                download="document.pdf"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <DownloadIcon className="size-3.5" />
                Download
              </a>
            </div>
          )}
        </div>
      )}

      {/* Live preview card */}
      <div className={`border border-border bg-card shadow-sm overflow-hidden ${
        isPreviewMaximized
          ? 'fixed inset-0 z-50 flex flex-col rounded-none'
          : 'rounded-xl'
      }`}>
        {/* Tab bar */}
        <div className="flex border-b border-border bg-muted shrink-0">
          {(['html', 'json'] as PreviewTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors
                ${activeTab === tab
                  ? 'border-b-2 border-primary text-foreground bg-card'
                  : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 px-3">
            <span className="text-[10px] text-muted-foreground font-medium">LIVE PREVIEW</span>
            <button
              type="button"
              title={isPreviewMaximized ? 'Restore' : 'Maximize'}
              onClick={() => setIsPreviewMaximized((v) => !v)}
              className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {isPreviewMaximized
                ? <Minimize2Icon className="w-3.5 h-3.5" />
                : <Maximize2Icon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Preview content */}
        <pre className={`overflow-auto text-xs leading-relaxed p-4 bg-secondary text-secondary-foreground font-mono ${
          isPreviewMaximized ? 'flex-1' : 'max-h-72'
        }`}>
          {activeTab === 'html' ? html : json}
        </pre>
      </div>
    </div>
  )
}

