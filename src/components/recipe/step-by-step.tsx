import Image from 'next/image'
import type { RecipeStep } from '@/types/recipe'

interface StepByStepProps {
  steps: RecipeStep[]
}

export function StepByStep({ steps }: StepByStepProps) {
  if (!steps || steps.length === 0) return null

  return (
    <section>
      <h2 className="mb-6 font-serif text-2xl font-bold">作り方</h2>
      <ol className="space-y-8">
        {steps.map((step) => (
          <li key={step.step} className="flex gap-4">
            {/* Step Number */}
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {step.step}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="recipe-prose text-base leading-relaxed">
                <p>{step.text}</p>
              </div>

              {step.image_url && (
                <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-xl">
                  <Image
                    src={step.image_url}
                    alt={`ステップ ${step.step}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                </div>
              )}

              {step.tip && (
                <div className="mt-3 rounded-lg bg-accent/5 border border-accent/10 px-4 py-3">
                  <p className="text-sm text-accent-dark">
                    <strong>ポイント:</strong> {step.tip}
                  </p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
