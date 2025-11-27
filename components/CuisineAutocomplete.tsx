'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'

// Major countries from Southeast Asia, East Asia, and Europe
export const CUISINE_SUGGESTIONS = [
  // Southeast Asia
  'Thai',
  'Vietnamese',
  'Indonesian',
  'Malaysian',
  'Filipino',
  'Singaporean',
  'Burmese',
  'Cambodian',
  'Laotian',

  // East Asia
  'Japanese',
  'Korean',
  'Chinese',

  // Europe
  'Italian',
  'French',
  'Spanish',
  'Greek',
  'German',
  'British',
  'Portuguese',
  'Turkish',
  'Polish',
  'Dutch',
  'Belgian',
  'Swiss',
  'Swedish',
  'Norwegian',
  'Danish',
  'Austrian',
  'Irish',
  'Croatian',
  'Hungarian',
  'Czech',

  // Popular additions
  'Mediterranean',
  'Asian Fusion',
].sort()

const MAX_CUISINE_LENGTH = 20

type CuisineAutocompleteProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  className?: string
}

export default function CuisineAutocomplete({ value, onChange, id, className }: CuisineAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (value.trim()) {
      const filtered = CUISINE_SUGGESTIONS.filter(cuisine =>
        cuisine.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions(CUISINE_SUGGESTIONS)
      setShowSuggestions(false)
    }
  }, [value])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Limit to max length
    if (newValue.length <= MAX_CUISINE_LENGTH) {
      onChange(newValue)
      setHighlightedIndex(-1)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'ArrowDown') {
        setShowSuggestions(true)
        setFilteredSuggestions(CUISINE_SUGGESTIONS)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleFocus = () => {
    if (!value.trim()) {
      setFilteredSuggestions(CUISINE_SUGGESTIONS)
      setShowSuggestions(true)
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={className}
        autoComplete="off"
        placeholder="e.g., Italian, Thai, Vietnamese"
        maxLength={MAX_CUISINE_LENGTH}
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition-colors ${
                index === highlightedIndex ? 'bg-orange-50' : ''
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
