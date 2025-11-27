'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type LineItemsInputProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  className?: string
  rows?: number
}

export default function LineItemsInput({
  id,
  label,
  value,
  onChange,
  placeholder = 'e.g., 2 cups flour\n1 cup sugar\n3 eggs',
  description = 'Enter ingredients separated by commas or line breaks.',
  className,
  rows = 6,
}: LineItemsInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-y"
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  )
}
