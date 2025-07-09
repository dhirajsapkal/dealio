"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface Option {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Type to search...",
  disabled = false,
  className,
}: ComboboxProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [filteredOptions, setFilteredOptions] = React.useState(options)
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, width: 0 })

  // Update input value when prop value changes
  React.useEffect(() => {
    const selectedOption = options.find(option => option.value === value)
    if (selectedOption) {
      setInputValue(selectedOption.label)
    } else if (!value) {
      setInputValue("")
    }
  }, [value, options])

  // Filter options based on input
  React.useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.value.toLowerCase().includes(inputValue.toLowerCase())
      )
      // Debug logging for search
      if (inputValue.toLowerCase().includes('sch')) {
        console.log('🔍 Searching for:', inputValue);
        console.log('🔍 All options:', options.map(o => o.label));
        console.log('🔍 Filtered results:', filtered.map(o => o.label));
      }
      setFilteredOptions(filtered)
    }
    setSelectedIndex(-1)
  }, [inputValue, options])

  // Update dropdown position when it's open
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      const updatePosition = () => {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect()
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            width: rect.width,
          })
        }
      }
      
      updatePosition()
      
      // Update position on scroll and resize
      const handleUpdate = () => updatePosition()
      window.addEventListener('scroll', handleUpdate, true)
      window.addEventListener('resize', handleUpdate)
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true)
        window.removeEventListener('resize', handleUpdate)
      }
    }
  }, [isOpen])

  // Handle clicks outside to close dropdown
  React.useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          inputRef.current &&
          dropdownRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          handleSelect(filteredOptions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (option: Option) => {
    setInputValue(option.label)
    onValueChange(option.value)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsOpen(true)
    if (!e.target.value.trim()) {
      onValueChange("")
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    // Delay closing to allow clicks on options
    setTimeout(() => setIsOpen(false), 150)
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      
      {isOpen && filteredOptions.length > 0 && inputRef.current && (
        <div
          ref={dropdownRef}
          className="fixed z-[999] bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              className={cn(
                "px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between",
                index === selectedIndex && "bg-gray-100",
                value === option.value && "bg-teal-50 text-teal-700"
              )}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              onClick={() => handleSelect(option)}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check className="h-4 w-4 text-teal-600" />
              )}
            </div>
          ))}
        </div>
      )}
      
      {isOpen && filteredOptions.length === 0 && inputValue.trim() && inputRef.current && (
        <div 
          className="fixed z-[999] bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-500"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          No options found
        </div>
      )}
    </div>
  )
} 