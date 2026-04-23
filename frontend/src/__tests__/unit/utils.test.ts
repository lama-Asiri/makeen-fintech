import { describe, it, expect } from 'vitest'
import { cn } from '../../app/components/ui/utils'

describe('cn (class name utility)', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple classes', () => {
    const result = cn('a', 'b', 'c')
    expect(result).toContain('a')
    expect(result).toContain('b')
    expect(result).toContain('c')
  })

  it('filters out falsy values', () => {
    const result = cn('a', false && 'b', undefined, null as never, 'c')
    expect(result).not.toContain('b')
    expect(result).toContain('a')
    expect(result).toContain('c')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    // twMerge keeps the last conflicting class
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
    expect(result).not.toContain('text-red-500')
  })

  it('preserves non-conflicting Tailwind classes', () => {
    const result = cn('p-4', 'text-white', 'bg-black')
    expect(result).toContain('p-4')
    expect(result).toContain('text-white')
    expect(result).toContain('bg-black')
  })

  it('handles conditional object syntax', () => {
    const active = true
    const disabled = false
    const result = cn({ 'text-green-500': active, 'opacity-50': disabled })
    expect(result).toContain('text-green-500')
    expect(result).not.toContain('opacity-50')
  })

  it('returns empty string when no valid classes provided', () => {
    expect(cn()).toBe('')
    expect(cn(false as never, undefined, null as never)).toBe('')
  })
})
