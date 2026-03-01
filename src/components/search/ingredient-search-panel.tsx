'use client'

import { Suspense } from 'react'
import { useIngredientSearch } from '@/hooks/use-ingredient-search'
import { IngredientAutocomplete } from './ingredient-autocomplete'
import { SelectedIngredients } from './selected-ingredients'
import { MatchIndicator } from './match-indicator'
import { PopularIngredients } from './popular-ingredients'
import { RecipeCard } from '@/components/recipe/recipe-card'
import type { IngredientAutocompleteResult } from '@/types/ingredient'

interface PopularIngredient {
  id: number
  name: string
}

interface IngredientSearchPanelProps {
  popularIngredients: PopularIngredient[]
}

function IngredientSearchPanelInner({ popularIngredients }: IngredientSearchPanelProps) {
  const {
    selectedIngredients,
    query,
    setQuery,
    suggestions,
    results,
    matchAll,
    loading,
    suggestionsLoading,
    addIngredient,
    removeIngredient,
    clearAll,
    toggleMatchAll,
    isAtLimit,
  } = useIngredientSearch()

  const selectedIds = new Set(selectedIngredients.map((i) => i.id))

  const handlePopularSelect = (ingredient: PopularIngredient) => {
    addIngredient({
      id: ingredient.id,
      name: ingredient.name,
      slug: '',
      name_reading: null,
      category: null,
      image_url: null,
    } as IngredientAutocompleteResult)
  }

  const selectedNames = selectedIngredients.map((i) => i.name)

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="space-y-3">
        <IngredientAutocomplete
          query={query}
          onQueryChange={setQuery}
          suggestions={suggestions}
          loading={suggestionsLoading}
          onSelect={addIngredient}
          disabled={isAtLimit}
        />

        <SelectedIngredients
          ingredients={selectedIngredients}
          onRemove={removeIngredient}
          onClearAll={clearAll}
        />

        {selectedIngredients.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMatchAll}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                matchAll ? 'bg-accent' : 'bg-muted'
              }`}
              role="switch"
              aria-checked={matchAll}
              aria-label="検索モード切替"
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  matchAll ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-muted-foreground">
              {matchAll ? 'すべて含む（AND検索）' : 'いずれかを含む（OR検索）'}
            </span>
          </div>
        )}
      </div>

      {/* Popular Ingredients */}
      <PopularIngredients
        ingredients={popularIngredients}
        selectedIds={selectedIds}
        onSelect={handlePopularSelect}
      />

      {/* Results */}
      {selectedIngredients.length > 0 && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {loading ? (
                <span className="text-muted-foreground">検索中...</span>
              ) : (
                <>
                  <span className="text-accent-dark">{selectedNames.join('、')}</span>
                  <span className="text-muted-foreground">
                    {matchAll ? 'をすべて含む' : 'を含む'}レシピ: {results.length}件
                  </span>
                </>
              )}
            </h2>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full bg-muted" />
                      <div className="h-6 w-12 rounded-full bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((recipe, index) => (
                <div key={recipe.id} className="space-y-2">
                  <RecipeCard
                    recipe={recipe}
                    variant="grid"
                    priority={index < 3}
                  />
                  <MatchIndicator
                    matchCount={recipe.match_count}
                    totalQueried={selectedIngredients.length}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState matchAll={matchAll} onToggleMatchAll={toggleMatchAll} />
          )}
        </div>
      )}

      {/* Initial Empty State */}
      {selectedIngredients.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/50"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            冷蔵庫にある食材を入力してみましょう
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            食材を追加すると、作れるレシピが見つかります
          </p>
        </div>
      )}
    </div>
  )
}

function EmptyState({
  matchAll,
  onToggleMatchAll,
}: {
  matchAll: boolean
  onToggleMatchAll: () => void
}) {
  return (
    <div className="py-12 text-center">
      <p className="text-lg font-medium text-muted-foreground">
        レシピが見つかりませんでした
      </p>
      {matchAll ? (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground/70 mb-3">
            「いずれかを含む」モードに切り替えると、より多くのレシピが見つかるかもしれません
          </p>
          <button
            type="button"
            onClick={onToggleMatchAll}
            className="inline-flex items-center rounded-lg border border-accent bg-accent/5 px-4 py-2 text-sm font-medium text-accent-dark transition-colors hover:bg-accent/10"
          >
            いずれかを含むモードに切り替える
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground/70">
          別の食材を試してみてください
        </p>
      )}
    </div>
  )
}

export function IngredientSearchPanel(props: IngredientSearchPanelProps) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">読み込み中...</div>}>
      <IngredientSearchPanelInner {...props} />
    </Suspense>
  )
}
