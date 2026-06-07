import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Helmet } from 'react-helmet-async'
import { NotificationBell } from '../components/NotificationBell'

interface Post {
  id: string
  title: string
  slug: string
  reading_time: number
  tags: string[]
  views: number
  published_at: string
  profiles: any
}

export function FeedPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [trending, setTrending] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [myUsername, setMyUsername] = useState('')
  const PAGE_SIZE = 10

  const fetchPosts = async (pageNum: number, replace = false) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, reading_time, tags, views, published_at, profiles!posts_author_id_fkey(username, avatar_url)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (error) { console.error(error); setLoading(false); return }
    if (replace) setPosts(data as Post[])
    else setPosts(prev => [...prev, ...data as Post[]])
    setHasMore(data.length === PAGE_SIZE)
    setLoading(false)
  }

  const fetchTrending = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, views, profiles!posts_author_id_fkey(username, avatar_url)')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(5)
    if (data) setTrending(data as Post[])
  }

  const fetchMyProfile = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    if (data) setMyUsername(data.username)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) { fetchPosts(0, true); return }
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, reading_time, tags, views, published_at, profiles!posts_author_id_fkey(username, avatar_url)')
      .eq('status', 'published')
      .or(`title.ilike.%${searchQuery}%,body_text.ilike.%${searchQuery}%`)
      .order('published_at', { ascending: false })
    if (data) setPosts(data as Post[])
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts(0, true)
    fetchTrending()
    fetchMyProfile()
  }, [])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <Helmet>
  <title>Chatter — Read and write stories</title>
  <meta name="description" content="Chatter is a publishing platform for writers and readers who prefer long-form text-based content." />
  <meta property="og:title" content="Chatter — Read and write stories" />
  <meta property="og:description" content="A credible alternative to Medium and Hashnode." />
  <meta property="og:type" content="website" />
</Helmet>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link to="/feed" className="text-xl font-bold text-indigo-600">Chatter</Link>
        <div className="flex items-center gap-3">
  <input
    type="text"
    placeholder="Search posts..."
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && handleSearch()}
    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
  <button
    onClick={handleSearch}
    className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
    Search
  </button>
  <Link to="/dashboard"
    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
    Dashboard
  </Link>
  <NotificationBell />
  <Link to="/write"
    className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
    Write
  </Link>
  <button
    onClick={handleSignOut}
    className="text-sm text-gray-500 hover:text-gray-800">
    Sign out
  </button>
</div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* Main feed */}
        <main id="main-content" className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Latest posts</h2>
          {posts.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-2">No posts yet</p>
              <Link to="/write" className="text-indigo-600 hover:underline text-sm">
                Be the first to write something
              </Link>
            </div>
          )}
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {hasMore && !loading && (
            <button
              onClick={loadMore}
              className="mt-8 w-full py-3 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Load more
            </button>
          )}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Trending</h3>
            {trending.length === 0 && (
              <p className="text-sm text-gray-400">No trending posts yet</p>
            )}
            <div className="space-y-3">
              {trending.map((post, i) => (
                <Link
                  key={post.id}
                  to={`/post/${post.slug}`}
                  className="flex gap-3 items-start hover:opacity-70 transition-opacity">
                  <span className="text-2xl font-bold text-gray-200">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(post.profiles as any)?.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-2">Your account</h3>
            <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
            <Link
              to="/write"
              className="block w-full text-center py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              Write a post
            </Link>
            <Link
              to={`/profile/${myUsername}`}
              className="block w-full text-center py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 mt-2">
              View profile
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  const author = post.profiles as any
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      })
    : ''

  return (
    <Link to={`/post/${post.slug}`}>
      <article className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700 overflow-hidden">
            {author?.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.username}
                className="w-full h-full object-cover"
              />
            ) : (
              author?.username?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <Link
            to={`/profile/${author?.username}`}
            className="text-sm text-gray-600 hover:text-indigo-600"
            onClick={e => e.stopPropagation()}>
            {author?.username}
          </Link>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2 flex-wrap">
            {post.tags?.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
            <span>{post.reading_time} min read</span>
            <span>{post.views} views</span>
          </div>
        </div>
      </article>
    </Link>
  )
}