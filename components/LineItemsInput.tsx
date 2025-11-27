'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type LineItemsInputProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  className?: string
}

const parseValue = (value: string) => {
  if (!value) return ['']
  return value.replace(/\r/g, '').split('\n')
}

export default function LineItemsInput({
  id,
  label,
  value,
  onChange,
  placeholder = 'e.g., 2 cups flour',
  description = 'One item per line. Press Enter to add another.',
  className,
}: LineItemsInputProps) {
  const [items, setItems] = useState<string[]>(() => parseValue(value))
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const parsed = parseValue(value)
    if (parsed.join('\n') !== items.join('\n')) {
      setItems(parsed.length ? parsed : [''])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const updateItems = (nextItems: string[], focusIndex?: number) => {
    const normalized = nextItems.length ? nextItems : ['']
    setItems(normalized)
    onChange(normalized.join('\n'))
    if (focusIndex !== undefined) {
      requestAnimationFrame(() => {
        inputRefs.current[focusIndex]?.focus()
      })
    }
  }

  const handleLineChange = (index: number, line: string) => {
    const next = [...items]
    next[index] = line
    updateItems(next)
  }

  const addLine = (index?: number) => {
    const insertIndex = index !== undefined ? index + 1 : items.length
    const next = [...items]
    next.splice(insertIndex, 0, '')
    updateItems(next, insertIndex)
  }

  const removeLine = (index: number) => {
    if (items.length === 1) {
      updateItems([''], 0)
      return
    }
    const next = items.filter((_, idx) => idx !== index)
    updateItems(next, Math.max(0, index - 1))
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="space-y-2">
        {items.map((line, index) => (
          <div key={`${id}-${index}`} className="flex items-center gap-2">
            <Input
              id={index === 0 ? id : undefined}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              value={line}
              placeholder={index === 0 ? placeholder : 'Another ingredient'}
              onChange={(e) => handleLineChange(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addLine(index)
                }
                if (e.key === 'Backspace' && !line && items.length > 1) {
                  e.preventDefault()
                  removeLine(index)
                }
              }}
              className="flex-1"
            />
            <div className="flex items-center gap-1">
              {index === items.length - 1 && (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => addLine(index)}
                  title="Add ingredient below"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => removeLine(index)}
                title="Remove ingredient"
                disabled={items.length === 1 && !line}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  )
}
