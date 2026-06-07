import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Editor } from '../components/Editor'
import slugify from 'slugify'

const TAGS = ['Technology', 'Programming', 'Design', 'Business', 'Science',
  'Health', 'Culture', 'Politics', 'Education', 'Travel']

function calcReadingTime(text: string) {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}

export function EditorPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [postId, setPostId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const savePost = useCallback(async (newStatus?: 'draft' | 'published') => {
    if (!user || !title.trim()) return
    setSaveStatus('saving')

    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now()
    const readingTime = calcReadingTime(bodyText)
    const currentStatus = newStatus || status

    const postData = {
      author_id: user.id,
      title,
      slug: postId ? undefined : slug,
      body_html: bodyHtml,
      body_text: bodyText,
      tags: selectedTags,
      reading_time: readingTime,
      status: currentStatus,
      published_at: currentStatus === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    if (postId) {
      const { error } = await supabase.from('posts')
        .update(postData).eq('id', postId)
      if (error) { setError(error.message); setSaveStatus('idle'); return }
    } else {
      const { data, error } = await supabase.from('posts')
        .insert({ ...postData, slug }).select().single()
      if (error) { setError(error.message); setSaveStatus('idle'); return }
      setPostId(data.id)
    }

    setSaveStatus('saved')
    if (newStatus === 'published') navigate('/feed')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }, [user, title, bodyHtml, bodyText, selectedTags, status, postId, navigate])

  // Autosave every 30 seconds
  useEffect(() => {
    if (!title.trim()) return
    const interval = setInterval(() => savePost(), 30000)
    return () => clearInterval(interval)
  }, [savePost, title])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < 5 ? [...prev, tag] : prev
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate('/feed')}
          className="text-gray-500 hover:text-gray-800 text-sm">
          ← Back to feed
        </button>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && <span className="text-sm text-gray-400">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-sm text-green-500">✓ Saved</span>}
          <button onClick={() => savePost('draft')}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            Save draft
          </button>
          <button onClick={() => savePost('published')}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Publish
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-10 px-4">
        {error && <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}

        {/* Title */}
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-4xl font-bold border-none outline-none bg-transparent mb-6 placeholder-gray-300"
        />

        {/* Reading time */}
        {bodyText && (
          <p className="text-sm text-gray-400 mb-4">
            {calcReadingTime(bodyText)} min read
          </p>
        )}

        {/* Editor */}
        <Editor
          content={bodyHtml}
          onChange={(html, text) => { setBodyHtml(html); setBodyText(text) }}
        />

        {/* Tags */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Tags (up to 5)
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}