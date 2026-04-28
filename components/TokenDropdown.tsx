'use client'

import type { Editor } from '@tiptap/react'
import { TagIcon } from 'lucide-react'
import { groupTokens, type TokenMap } from '@/lib/tokens'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  editor: Editor | null
  tokens: TokenMap
}

export function TokenDropdown({ editor, tokens }: Props) {
  const groups = groupTokens(tokens)
  const hasTokens = Object.keys(tokens).length > 0
  const categoryEntries = Object.entries(groups)

  function insert(key: string, label: string) {
    editor?.chain().focus().insertToken({ key, label }).run()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasTokens}
          className="h-8 gap-1.5 text-sm"
        >
          <TagIcon className="size-3.5" />
          Tokens
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64"
        // prevent the editor from losing focus when interacting with the dropdown
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {categoryEntries.map(([category, items], gi) => (
          <DropdownMenuGroup key={category}>
            {gi > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{category}</DropdownMenuLabel>
            {items.map(({ key, label }) => (
              <DropdownMenuItem key={key} onSelect={() => insert(key, label)} className="cursor-pointer">
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

