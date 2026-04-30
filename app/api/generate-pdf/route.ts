import { NextRequest, NextResponse } from 'next/server'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { Node, mergeAttributes } from '@tiptap/core'
import { MOCK_TOKENS } from '@/lib/tokens'
import { FAKE_VALUES, replacePlaceholders } from '@/lib/fakeValues'
import type { JSONContent } from '@tiptap/core'

// ---------------------------------------------------------------------------
// Minimal server-side Token node (mirrors TokenExtension but without nodeView)
// ---------------------------------------------------------------------------
const TokenNode = Node.create({
  name: 'token',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      key: { default: null, parseHTML: (el) => el.getAttribute('data-token'), renderHTML: (a) => ({ 'data-token': a.key }) },
      label: { default: null, parseHTML: (el) => el.getAttribute('data-label'), renderHTML: (a) => ({ 'data-label': a.label }) },
    }
  },
  parseHTML() { return [{ tag: 'span[data-token]' }] },
  renderHTML({ node }) {
    return ['span', mergeAttributes({ 'data-token': node.attrs.key }), `{{${node.attrs.key}}}`]
  },
})

// ---------------------------------------------------------------------------
// Collect all token keys from a TipTap JSON document
// ---------------------------------------------------------------------------
function collectTokenKeys(node: JSONContent): string[] {
  const keys: string[] = []
  if (node.type === 'token' && node.attrs?.key) keys.push(node.attrs.key)
  if (node.content) node.content.forEach((child) => keys.push(...collectTokenKeys(child)))
  return keys
}

// ---------------------------------------------------------------------------
// Page margin configuration (adjust these to change PDF margins)
// ---------------------------------------------------------------------------
const PDF_MARGINS = {
  top:    '20mm',
  right:  '20mm',
  bottom: '20mm',
  left:   '20mm',
} as const

function buildHeaderHTML(): string {
  return `<div style="font-size:11px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#94a3b8; width:100%; padding:6px 20mm; box-sizing:border-box; display:flex; justify-content:space-between; align-items:center; background-image:linear-gradient(#0f172a,#0f172a); border-bottom:3px solid #c99f00;">
    <span style="font-size:13px; font-weight:700; color:#f8fafc; letter-spacing:-0.02em;">Rex<span style="color:#c99f00;">wood</span></span>
    <span style="text-align:right; line-height:1.5; color:#94a3b8;">
      Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}&nbsp;&nbsp;·&nbsp;&nbsp;Confidential Document
    </span>
  </div>`
}

function buildFooterHTML(): string {
  return `<div style="font-size:10px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#94a3b8; width:100%; padding-block-start:5mm; padding-inline:20mm; box-sizing:border-box; display:flex; justify-content:space-between; align-items:center; background-image:linear-gradient(#f8fafc,#f8fafc); border-top:1px solid #e2e8f0;">
    <span>This document was automatically generated and may contain placeholder values.</span>
    <span style="color:#94a3b8; font-weight:500;">REXWOOD &nbsp;·&nbsp; CONFIDENTIAL &nbsp;·&nbsp; Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
  </div>`
}

// ---------------------------------------------------------------------------
// Build a self-contained HTML document for Puppeteer
// ---------------------------------------------------------------------------
function buildPageHTML(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { font-size: 16px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    body {
      font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.75;
      color: #111827;
      background: #ffffff;
    }

    /* ── Page shell ─────────────────────────────────────────── */
    .page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ── Header bar ─────────────────────────────────────────── */
    .page-header {
      background: linear-gradient(135deg, #0d0b00 0%, #1a1400 60%, #2a1f00 100%);
      padding: 28px 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-header .brand {
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.02em;
    }
    .page-header .brand span {
      color: #c99f00;
    }
    .page-header .meta {
      font-size: 11px;
      color: #94a3b8;
      text-align: right;
      line-height: 1.5;
    }

    /* ── Accent rule under header ───────────────────────────── */
    .accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #7a5f00 0%, #c99f00 45%, #e8bc00 70%, #a07800 100%);
    }

    /* ── Main content ───────────────────────────────────────── */
    .content {
      flex: 1;
      max-width: 100%;
    }

    /* ── Typography ─────────────────────────────────────────── */
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px;
      line-height: 1.25;
      letter-spacing: -0.025em;
      padding-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin: 32px 0 10px;
      line-height: 1.3;
      letter-spacing: -0.015em;
    }
    h3 {
      font-size: 15px;
      font-weight: 600;
      color: #334155;
      margin: 24px 0 8px;
      line-height: 1.4;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 11.5px;
      color: #64748b;
    }
    p {
      margin: 0 0 12px;
      color: #374151;
    }
    p:last-child { margin-bottom: 0; }

    strong { font-weight: 600; color: #111827; }
    em { font-style: italic; color: #4b5563; }
    s  { text-decoration: line-through; color: #9ca3af; }

    /* ── Lists ──────────────────────────────────────────────── */
    ul, ol {
      padding-left: 20px;
      margin: 8px 0 14px;
    }
    ul { list-style-type: disc; }
    ul li::marker { color: #e8bc00; font-size: 1.1em; }
    ol { list-style-type: decimal; }
    li {
      margin: 4px 0;
      color: #374151;
    }

    /* ── Blockquote ─────────────────────────────────────────── */
    blockquote {
      border-left: 3px solid #e8bc00;
      background: #eff6ff;
      padding: 14px 18px;
      margin: 16px 0;
      border-radius: 0 6px 6px 0;
    }
    blockquote p {
      color: #e8bc00;
      font-style: italic;
      margin: 0;
    }

    /* ── Inline code ────────────────────────────────────────── */
    code {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 12.5px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      color: #be123c;
    }

    /* ── Code block ─────────────────────────────────────────── */
    pre {
      background: #0f172a;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 14px 0;
      overflow-x: auto;
      border: 1px solid #1e293b;
    }
    pre code {
      background: none;
      border: none;
      padding: 0;
      color: #e2e8f0;
      font-size: 12.5px;
      line-height: 1.7;
    }

    /* ── HR ─────────────────────────────────────────────────── */
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0;
    }

    /* ── Footer ─────────────────────────────────────────────── */
    .page-footer {
      padding: 16px 56px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-footer .note {
      font-size: 10.5px;
      color: #94a3b8;
    }
    .page-footer .stamp {
      font-size: 10.5px;
      color: #cbd5e1;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="page">
    <main class="content">
      ${body}
    </main>
  </div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  let body: { content: JSONContent }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { content } = body

  if (!content || typeof content !== 'object') {
    return NextResponse.json({ error: 'Missing content field' }, { status: 400 })
  }

  // --- 1. Validate tokens --------------------------------------------------
  const usedKeys = collectTokenKeys(content)
  const invalidKeys = usedKeys.filter((k) => !MOCK_TOKENS[k])
  if (invalidKeys.length > 0) {
    return NextResponse.json(
      { error: `Unknown token(s): ${invalidKeys.join(', ')}` },
      { status: 422 },
    )
  }

  // --- 2. JSON → HTML via TipTap -------------------------------------------
  let rawHtml: string
  try {
    rawHtml = generateHTML(content, [StarterKit, TokenNode])
  } catch (err) {
    console.error('generateHTML failed', err)
    return NextResponse.json({ error: 'Failed to convert content to HTML' }, { status: 500 })
  }

  // --- 3. Replace {{tokens}} with fake values -------------------------------
  const resolvedHtml = replacePlaceholders(rawHtml, FAKE_VALUES)

  // --- 4. Generate PDF with Puppeteer --------------------------------------
  let pdfBuffer: Buffer
  try {
    const puppeteerCore = (await import('puppeteer-core')).default

    let executablePath: string
    let launchArgs: string[]

    // use the Chromium bundled with the `puppeteer` devDependency
    const fullPuppeteer = (await import('puppeteer')).default
    executablePath = fullPuppeteer.executablePath()
    launchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']

    const browser = await puppeteerCore.launch({
      executablePath,
      args: launchArgs,
      headless: true,
    })
    const page = await browser.newPage()
    await page.setContent(buildPageHTML(resolvedHtml), { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: PDF_MARGINS,
      headerTemplate: buildHeaderHTML(),
      footerTemplate: buildFooterHTML(),
      displayHeaderFooter: true
    })
    await browser.close()
    pdfBuffer = Buffer.from(pdf)
  } catch (err) {
    console.error('Puppeteer error', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }

  // --- 5. Return PDF directly as binary response ---------------------------
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdfBuffer.length),
    },
  })
}
