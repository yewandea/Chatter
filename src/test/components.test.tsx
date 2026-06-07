import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Test 1: PostCard component
function PostCard({ title, tags, readingTime }: {
  title: string; tags: string[]; readingTime: number
}) {
  return (
    <div>
      <h2>{title}</h2>
      <span>{readingTime} min read</span>
      {tags.map(tag => <span key={tag}>{tag}</span>)}
    </div>
  )
}

describe('PostCard', () => {
  it('renders title and reading time', () => {
    render(<PostCard title="Test Post" tags={['Tech']} readingTime={3} />)
    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('3 min read')).toBeInTheDocument()
  })
  it('renders tags', () => {
    render(<PostCard title="Post" tags={['Tech', 'Science']} readingTime={1} />)
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('Science')).toBeInTheDocument()
  })
})

// Test 2: TagPill component
function TagPill({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>
}

describe('TagPill', () => {
  it('renders label', () => {
    render(<TagPill label="Technology" onClick={() => {}} />)
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })
  it('fires onClick', () => {
    const onClick = vi.fn()
    render(<TagPill label="Tech" onClick={onClick} />)
    fireEvent.click(screen.getByText('Tech'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

// Test 3: CommentThread component
function CommentThread({ comments }: { comments: { id: string; body: string; author: string }[] }) {
  return (
    <div>
      {comments.map(c => (
        <div key={c.id}>
          <span>{c.author}</span>
          <p>{c.body}</p>
        </div>
      ))}
    </div>
  )
}

describe('CommentThread', () => {
  it('renders all comments', () => {
    const comments = [
      { id: '1', body: 'Great post!', author: 'alice' },
      { id: '2', body: 'Thanks!', author: 'bob' },
    ]
    render(<CommentThread comments={comments} />)
    expect(screen.getByText('Great post!')).toBeInTheDocument()
    expect(screen.getByText('Thanks!')).toBeInTheDocument()
    expect(screen.getByText('alice')).toBeInTheDocument()
  })
})

// Test 4: AnalyticsDashboard stat display
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total views" value={42} />)
    expect(screen.getByText('Total views')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})