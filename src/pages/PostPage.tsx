import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DOMPurify from 'dompurify'
import { CommentSection } from '../components/CommentSection'
import { Helmet } from 'react-helmet-async'
import { NotificationBell } from '../components/NotificationBell'

interface Post {
  id: string
  title: string
  body_html: string
  reading_time: number
  tags: string[]
  views: number
  published_at: string
  author_id: string
  profiles: { username: string; avatar_url: string }
}

export function PostPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_author_id_fkey(username, avatar_url)')
      .eq('slug', slug)
      .single()

    if (error || !data) { console.log('Post error:', error); navigate('/feed'); return }
    setPost(data as Post)
    
    const { data: followData } = await supabase
  .from('follows')
  .select('*')
  .eq('follower_id', user.id)
  .eq('following_id', data.author_id)
  .single()
setFollowing(!!followData)

    // Increment views
    await supabase.from('posts')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', data.id)

    // Check if liked/bookmarked
    if (user) {
      const [{ data: likeData }, { data: bookmarkData }, { count }] = await Promise.all([
        supabase.from('likes').select('*').eq('post_id', data.id).eq('user_id', user.id).single(),
        supabase.from('bookmarks').select('*').eq('post_id', data.id).eq('user_id', user.id).single(),
        supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', data.id),
      ])
      setLiked(!!likeData)
      setBookmarked(!!bookmarkData)
      setLikeCount(count || 0)
    }
    setLoading(false)
  }

  const toggleLike = async () => {
  if (!user || !post) return
  if (liked) {
    await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
    setLiked(false); setLikeCount(c => c - 1)
  } else {
    await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
    setLiked(true); setLikeCount(c => c + 1)
    // Notify post author
    if (post.author_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: post.author_id,
        type: 'like',
        ref_id: post.id,
        message: `Someone liked your post "${post.title}"`
      })
    }
  }
}

  const toggleBookmark = async () => {
    if (!user || !post) return
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('post_id', post.id).eq('user_id', user.id)
      setBookmarked(false)
    } else {
      await supabase.from('bookmarks').insert({ post_id: post.id, user_id: user.id })
      setBookmarked(true)
    }

  }
  const toggleFollow = async () => {
  if (!user || !post) return
  if (following) {
    await supabase.from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', post.author_id)
    setFollowing(false)
  } else {
    await supabase.from('follows')
      .insert({ follower_id: user.id, following_id: post.author_id })
    setFollowing(true)
  }
}

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!post) return null

  const author = post.profiles as any
  const date = new Date(post.published_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-white">
        <Helmet>
  <title>{post.title} — Chatter</title>
  <meta name="description" content={post.body_html?.replace(/<[^>]*>/g, '').slice(0, 160)} />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.body_html?.replace(/<[^>]*>/g, '').slice(0, 160)} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={window.location.href} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={post.title} />
  <meta name="twitter:description" content={post.body_html?.replace(/<[^>]*>/g, '').slice(0, 160)} />
</Helmet>
      {/* Navbar */}
      <nav className="border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
  <div className="flex items-center gap-4">
    <Link to="/feed" className="text-gray-500 hover:text-gray-800 text-sm">
      ← Back
    </Link>
    <Link to="/feed" className="text-xl font-bold text-indigo-600">Chatter</Link>
  </div>
  <div className="flex items-center gap-3">
    <button
  onClick={toggleLike}
  aria-label={liked ? 'Unlike post' : 'Like post'}
  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
    liked ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
  }`}>
  {liked ? '❤️' : '🤍'} {likeCount}
</button>
<button
  onClick={toggleBookmark}
  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
    bookmarked ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
  }`}>
  {bookmarked ? '🔖 Saved' : '🔖 Save'}
</button>
    <NotificationBell />
  </div>
</nav>

      <article className="max-w-2xl mx-auto px-4 py-12">
        {/* Tags */}
        <div className="flex gap-2 mb-4">
          {post.tags?.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Author + meta */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-700">
            {author?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{author?.username}</p>
            <p className="text-xs text-gray-400">{date} · {post.reading_time} min read · {post.views} views</p>
          </div>
        </div>

        {user?.id !== post.author_id && (
  <button
    onClick={toggleFollow}
    className={`ml-auto px-4 py-1.5 text-sm rounded-lg border transition-colors ${
      following
        ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
        : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
    }`}
  >
    {following ? 'Following' : 'Follow'}
  </button>
)}

        {/* Body */}
        <div
          className="text-gray-800 leading-relaxed"
          style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.body_html || '')
          }}
        />
        {/* Comments */}
        <CommentSection postId={post.id} />
      </article>
    </div>
  )
}