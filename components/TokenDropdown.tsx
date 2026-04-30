'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { TagIcon, SearchIcon } from 'lucide-react'
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
  const [query, setQuery] = useState('')
  const hasTokens = Object.keys(tokens).length > 0

  const q = query.trim().toLowerCase()

  // When searching, show a flat filtered list; otherwise show grouped
  const filteredEntries = Object.entries(tokens).filter(
    ([key, { label }]) => !q || key.includes(q) || label.toLowerCase().includes(q),
  )

  const groups = groupTokens(
    Object.fromEntries(filteredEntries) as TokenMap,
  )
  const categoryEntries = Object.entries(groups)

  function insert(key: string, label: string) {
    editor?.chain().focus().insertToken({ key, label }).run()
  }

  return (
    <DropdownMenu onOpenChange={(open) => { if (!open) setQuery('') }}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasTokens}
          className="h-8 gap-1.5 text-sm"
          title={'Insert token'}
        >
          <TagIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-sm p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border">
          <SearchIcon className="size-3.5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search tokens…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-72 p-1.5 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          {filteredEntries.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">No tokens found</p>
          ) : (
            categoryEntries.map(([category, items], gi) => (
              <DropdownMenuGroup key={category}>
                {gi > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </DropdownMenuLabel>
                {items.map(({ key, label }) => (
                  <DropdownMenuItem
                    key={key}
                    onSelect={() => insert(key, label)}
                    className="cursor-pointer flex items-center justify-between gap-3 min-w-0"
                  >
                    <span className="truncate">{label}</span>
                    <span className="font-mono text-[0.7rem] text-muted-foreground shrink-0 max-w-[40%] truncate">{`{{${key}}}`}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

