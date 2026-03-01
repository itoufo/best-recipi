'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from './use-debounce'
import type { IngredientAutocompleteResult } from '@/types/ingredient'
import type { CombinationSearchResult } from '@/types/recipe'

interface SelectedIngredient {
  id: number
  name: string
}

export function useIngredientSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<IngredientAutocompleteResult[]>([])
  const [results, setResults] = useState<CombinationSearchResult[]>([])
  const [matchAll, setMatchAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 200)
  const initializedRef = useRef(false)
  const selectedIdsSet = new Set(selectedIngredients.map((i) => i.id))

  // Restore state from URL on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const idsParam = searchParams.get('ingredients')
    const matchAllParam = searchParams.get('match_all')

    if (matchAllParam === 'true') setMatchAll(true)

    if (idsParam) {
      const ids = idsParam.split(',').map(Number).filter(Boolean)
      if (ids.length > 0) {
        // Fetch ingredient names for the IDs
        fetch(`/api/ingredients/autocomplete?q=`)
          .then(() => {
            // We need a different approach - fetch from search results or a dedicated endpoint
            // For now, set with IDs only and fill names from search results
          })
          .catch(() => {})

        // Use a simpler approach: fetch each ingredient by autocomplete
        Promise.all(
          ids.map((id) =>
            fetch(`/api/ingredients/search?ids=${id}&match_all=false`)
              .then((r) => r.json())
              .catch(() => ({ recipes: [] }))
          )
        ).then(() => {
          // Set IDs with placeholder names, they'll be resolved
          setSelectedIngredients(ids.map((id) => ({ id, name: `食材 #${id}` })))
        })
      }
    }
  }, [searchParams])

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 1) {
      setSuggestions([])
      return
    }

    setSuggestionsLoading(true)
    fetch(`/api/ingredients/autocomplete?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = (data.ingredients || []).filter(
          (s: IngredientAutocompleteResult) => !selectedIdsSet.has(s.id)
        )
        setSuggestions(filtered)
      })
      .catch(() => setSuggestions([]))
      .finally(() => setSuggestionsLoading(false))
  }, [debouncedQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch recipe results when selection changes
  useEffect(() => {
    if (selectedIngredients.length === 0) {
      setResults([])
      return
    }

    const ids = selectedIngredients.map((i) => i.id).join(',')
    setLoading(true)
    fetch(`/api/ingredients/search?ids=${ids}&match_all=${matchAll}`)
      .then((r) => r.json())
      .then((data) => setResults(data.recipes || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [selectedIngredients, matchAll])

  // Sync URL
  useEffect(() => {
    if (!initializedRef.current) return

    const params = new URLSearchParams()
    if (selectedIngredients.length > 0) {
      params.set('ingredients', selectedIngredients.map((i) => i.id).join(','))
    }
    if (matchAll) {
      params.set('match_all', 'true')
    }

    const paramString = params.toString()
    const url = paramString ? `/search/ingredients?${paramString}` : '/search/ingredients'
    router.replace(url, { scroll: false })
  }, [selectedIngredients, matchAll, router])

  const addIngredient = useCallback((ingredient: IngredientAutocompleteResult) => {
    setSelectedIngredients((prev) => {
      if (prev.length >= 10) return prev
      if (prev.some((i) => i.id === ingredient.id)) return prev
      return [...prev, { id: ingredient.id, name: ingredient.name }]
    })
    setQuery('')
    setSuggestions([])
  }, [])

  const removeIngredient = useCallback((id: number) => {
    setSelectedIngredients((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setSelectedIngredients([])
    setQuery('')
    setSuggestions([])
  }, [])

  const toggleMatchAll = useCallback(() => {
    setMatchAll((prev) => !prev)
  }, [])

  const filteredSuggestions = suggestions.filter((s) => !selectedIdsSet.has(s.id))

  return {
    selectedIngredients,
    query,
    setQuery,
    suggestions: filteredSuggestions,
    results,
    matchAll,
    loading,
    suggestionsLoading,
    addIngredient,
    removeIngredient,
    clearAll,
    toggleMatchAll,
    isAtLimit: selectedIngredients.length >= 10,
  }
}
