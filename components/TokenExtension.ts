import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { MutableRefObject } from 'react'
import type { TokenMap } from '@/lib/tokens'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    token: {
      /** Insert an immutable token chip at the current cursor position. */
      insertToken: (attrs: { key: string; label: string }) => ReturnType
    }
  }
}

const tokenAutoDetectKey = new PluginKey('tokenAutoDetect')

/**
 * Creates the token node extension wired to a live ref of the token map.
 *
 * Any `{{key}}` placeholder found in plain text — whether typed character by
 * character, pasted, or set programmatically — is automatically replaced with
 * an immutable token chip node.
 */
export function createTokenExtension(tokensRef: MutableRefObject<TokenMap>) {
  return Node.create({
    name: 'token',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
      return {
        key: {
          default: null,
          parseHTML: (el) => el.getAttribute('data-token'),
          renderHTML: (attrs) => ({ 'data-token': attrs.key }),
        },
        label: {
          default: null,
          parseHTML: (el) => el.getAttribute('data-label'),
          renderHTML: (attrs) => ({ 'data-label': attrs.label }),
        },
      }
    },

    parseHTML() {
      return [{ tag: 'span[data-token]' }]
    },

    renderHTML({ node }) {
      return [
        'span',
        mergeAttributes({
          'data-token': node.attrs.key,
          'data-label': node.attrs.label,
          class: 'token-chip',
        }),
        `{{${node.attrs.key}}}`,
      ]
    },

    addNodeView() {
      return ({ node }) => {
        const dom = document.createElement('span')
        dom.setAttribute('data-token', node.attrs.key)
        dom.setAttribute('contenteditable', 'false')
        dom.className = 'token-chip'

        const keyEl = document.createElement('span')
        keyEl.className = 'token-chip-key'
        keyEl.textContent = `{{${node.attrs.key}}}`

        dom.appendChild(keyEl)

        return { dom }
      }
    },

    addCommands() {
      return {
        insertToken:
          (attrs) =>
          ({ commands }) =>
            commands.insertContent({ type: this.name, attrs }),
      }
    },

    addProseMirrorPlugins() {
      const tokenNodeType = this.type

      return [
        new Plugin({
          key: tokenAutoDetectKey,
          appendTransaction(_transactions, _oldState, newState) {
            const docChanged = _transactions.some((tr) => tr.docChanged)
            if (!docChanged) return null

            // Collect all {{key}} matches in text nodes, back-to-front so
            // replacements don't shift the positions of earlier matches.
            const replacements: Array<{
              from: number
              to: number
              key: string
              label: string
            }> = []

            const PATTERN = /\{\{(\w+)\}\}/g

            newState.doc.descendants((node, pos) => {
              if (!node.isText) return
              const text = node.text!
              let match: RegExpExecArray | null
              PATTERN.lastIndex = 0
              while ((match = PATTERN.exec(text)) !== null) {
                const key = match[1]
                const tokenDef = tokensRef.current[key]
                if (!tokenDef) continue
                replacements.push({
                  from: pos + match.index,
                  to: pos + match.index + match[0].length,
                  key,
                  label: tokenDef.label,
                })
              }
            })

            if (replacements.length === 0) return null

            const tr = newState.tr
            // Apply in reverse so earlier positions stay valid
            for (const { from, to, key, label } of replacements.reverse()) {
              tr.replaceWith(from, to, tokenNodeType.create({ key, label }))
            }
            return tr
          },
        }),
      ]
    },
  })
}
