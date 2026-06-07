import { describe, it, expect } from 'vitest'

// Test 1: Reading time calculator
function calcReadingTime(text: string): number {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}

describe('calcReadingTime', () => {
  it('returns 1 for short text', () => {
    expect(calcReadingTime('hello world')).toBe(1)
  })
  it('returns correct minutes for long text', () => {
    const words = Array(400).fill('word').join(' ')
    expect(calcReadingTime(words)).toBe(2)
  })
})

// Test 2: Feed sort algorithm
function sortByRecent(posts: { published_at: string }[]) {
  return [...posts].sort((a, b) =>
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  )
}

describe('sortByRecent', () => {
  it('sorts posts newest first', () => {
    const posts = [
      { published_at: '2024-01-01' },
      { published_at: '2024-03-01' },
      { published_at: '2024-02-01' },
    ]
    const sorted = sortByRecent(posts)
    expect(sorted[0].published_at).toBe('2024-03-01')
  })
})

// Test 3: Analytics aggregator
function aggregateViews(posts: { views: number }[]): number {
  return posts.reduce((sum, p) => sum + p.views, 0)
}

describe('aggregateViews', () => {
  it('sums views correctly', () => {
    const posts = [{ views: 10 }, { views: 20 }, { views: 5 }]
    expect(aggregateViews(posts)).toBe(35)
  })
  it('returns 0 for empty array', () => {
    expect(aggregateViews([])).toBe(0)
  })
})

// Test 4: Form validation
function validatePostForm(title: string, body: string): string[] {
  const errors: string[] = []
  if (!title.trim()) errors.push('Title is required')
  if (title.length > 200) errors.push('Title is too long')
  if (!body.trim()) errors.push('Body is required')
  return errors
}

describe('validatePostForm', () => {
  it('returns errors for empty fields', () => {
    const errors = validatePostForm('', '')
    expect(errors).toContain('Title is required')
    expect(errors).toContain('Body is required')
  })
  it('returns no errors for valid input', () => {
    const errors = validatePostForm('My Post', 'Some content here')
    expect(errors).toHaveLength(0)
  })
  it('returns error for title too long', () => {
    const errors = validatePostForm('a'.repeat(201), 'body')
    expect(errors).toContain('Title is too long')
  })
})