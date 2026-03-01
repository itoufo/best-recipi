'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import type { IngredientAutocompleteResult } from '@/types/ingredient'

interface IngredientAutocompleteProps {
  query: string
  onQueryChange: (q: string) => void
  suggestions: IngredientAutocompleteResult[]
  loading: boolean
  onSelect: (ingredient: IngredientAutocompleteResult) => void
  disabled?: boolean
}

export function IngredientAutocomplete({
  query,
  onQueryChange,
  suggestions,
  loading,
  onSelect,
  disabled = false,
}: IngredientAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const showDropdown = isOpen && query.length >= 1

  useEffect(() => {
    if (suggestions.length > 0 && query.length >= 1) {
      setIsOpen(true)
      setActiveIndex(-1)
    }
  }, [suggestions, query])

  const handleSelect = useCallback(
    (ingredient: IngredientAutocompleteResult) => {
      onSelect(ingredient)
      setIsOpen(false)
      setActiveIndex(-1)
      inputRef.current?.focus()
    },
    [onSelect]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex >= 0 && activeIndex < suggestions.length) {
            handleSelect(suggestions[activeIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setActiveIndex(-1)
          break
      }
    },
    [showDropdown, suggestions, activeIndex, handleSelect]
  )

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setIsOpen(false), 200)
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? '上限10食材に達しました' : '食材名を入力...'}
          disabled={disabled}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-${suggestions[activeIndex]?.id}` : undefined
          }
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-accent" />
          </div>
        )}
      </div>

      {showDropdown && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-auto rounded-xl border border-border bg-card shadow-lg max-h-80"
        >
          {suggestions.length === 0 && !loading && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              見つかりませんでした
            </li>
          )}
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              id={`suggestion-${item.id}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 min-h-[48px] transition-colors ${
                index === activeIndex
                  ? 'bg-accent/10 text-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground/40">
                  <IngredientIcon />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{item.name}</span>
                {item.name_reading && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.name_reading}
                  </span>
                )}
              </div>
              {item.category && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {item.category}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function IngredientIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 21h10" />
      <path d="M12 21V11" />
      <path d="M12 11a5 5 0 0 0 5-5H7a5 5 0 0 0 5 5Z" />
      <path d="M12 4V2" />
    </svg>
  )
}
