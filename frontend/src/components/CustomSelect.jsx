import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option',
  required = false,
  label = '',
  name = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)
  const selectedLabel = selectedOption?.label || placeholder

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } })
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-input bg-card text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent flex items-center justify-between hover:bg-card/80 transition text-left shadow-sm"
      >
        <span className={selectedOption ? 'text-foreground font-medium' : 'text-muted-foreground'}>
          {selectedLabel}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="max-h-72 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-4 text-sm text-muted-foreground text-center">
                No options available
              </div>
            ) : (
              options.map((option, index) => (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-3 transition flex items-center justify-between ${
                    value === option.value
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
