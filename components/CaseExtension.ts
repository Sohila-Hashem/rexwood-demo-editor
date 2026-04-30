import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    uppercase: {
      /** Apply uppercase text transform to selection. */
      setUppercase: () => ReturnType
      toggleUppercase: () => ReturnType
      unsetUppercase: () => ReturnType
    }
    lowercase: {
      /** Apply lowercase text transform to selection. */
      setLowercase: () => ReturnType
      toggleLowercase: () => ReturnType
      unsetLowercase: () => ReturnType
    }
    capitalize: {
      /** Apply capitalize (title-case) text transform to selection. */
      setCapitalize: () => ReturnType
      toggleCapitalize: () => ReturnType
      unsetCapitalize: () => ReturnType
    }
  }
}

export const Uppercase = Mark.create({
  name: 'uppercase',

  parseHTML() {
    return [
      { tag: 'span[data-case="uppercase"]' },
      {
        style: 'text-transform',
        getAttrs: (value) => (value === 'uppercase' ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-case': 'uppercase', style: 'text-transform: uppercase' }),
      0,
    ]
  },

  addCommands() {
    return {
      setUppercase:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      toggleUppercase:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
      unsetUppercase:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})

export const Lowercase = Mark.create({
  name: 'lowercase',

  parseHTML() {
    return [
      { tag: 'span[data-case="lowercase"]' },
      {
        style: 'text-transform',
        getAttrs: (value) => (value === 'lowercase' ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-case': 'lowercase', style: 'text-transform: lowercase' }),
      0,
    ]
  },

  addCommands() {
    return {
      setLowercase:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      toggleLowercase:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
      unsetLowercase:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})

export const Capitalize = Mark.create({
  name: 'capitalize',

  parseHTML() {
    return [
      { tag: 'span[data-case="capitalize"]' },
      {
        style: 'text-transform',
        getAttrs: (value) => (value === 'capitalize' ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-case': 'capitalize', style: 'text-transform: capitalize' }),
      0,
    ]
  },

  addCommands() {
    return {
      setCapitalize:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      toggleCapitalize:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
      unsetCapitalize:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    }
  },
})
