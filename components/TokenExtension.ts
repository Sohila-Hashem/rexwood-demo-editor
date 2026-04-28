import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    token: {
      /** Insert an immutable token chip at the current cursor position. */
      insertToken: (attrs: { key: string; label: string }) => ReturnType
    }
  }
}

export const TokenExtension = Node.create({
  name: 'token',
  group: 'inline',
  inline: true,
  atom: true, // treated as a single immutable unit — not editable

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

  /**
   * HTML output uses {{key}} syntax so the serialised value
   * is the template placeholder, not the display label.
   */
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

  /** DOM node view — renders a non-editable badge with label + key hint. */
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
})
