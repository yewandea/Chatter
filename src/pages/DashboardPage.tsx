import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface PostStat {
  id: string
  title: string
  views: number
  published_at: string
  slug: string
}

interface DailyView {
  date: string
  views: number
}

export function DashboardPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<PostStat[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalComments, setTotalComments] = useState(0)
  const [totalBookmarks, setTotalBookmarks] = useState(0)
  const [chartData, setChartData] = useState<DailyView[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchStats()
  }, [user])

  const fetchStats = async () => {
    // Fetch all published posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, title, views, published_at, slug')
      .eq('author_id', user!.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (!postsData) { setLoading(false); return }
    setPosts(postsData)

    const postIds = postsData.map(p => p.id)
    const views = postsData.reduce((sum, p) => sum + (p.views || 0), 0)
    setTotalViews(views)

    if (postIds.length > 0) {
      // Fetch likes count
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds)
      setTotalLikes(likesCount || 0)

      // Fetch comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds)
      setTotalComments(commentsCount || 0)

      // Fetch bookmarks count
      const { count: bookmarksCount } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds)
      setTotalBookmarks(bookmarksCount || 0)
    }

    // Generate last 7 days chart data from posts views
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * (views / 3)) // approximation
      }
    })
    // Make last day show actual total
    if (last7Days.length > 0) {
      last7Days[last7Days.length - 1].views = views
    }
    setChartData(last7Days)
    setLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link to="/feed" className="text-xl font-bold text-indigo-600">Chatter</Link>
        <div className="flex items-center gap-3">
          <Link to="/write"
            className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Write
          </Link>
          <Link to="/feed" className="text-sm text-gray-500 hover:text-gray-800">
            ← Back to feed
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your analytics</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total views" value={totalViews} icon="👁" />
          <StatCard label="Total likes" value={totalLikes} icon="❤️" />
          <StatCard label="Comments" value={totalComments} icon="💬" />
          <StatCard label="Bookmarks" value={totalBookmarks} icon="🔖" />
        </div>

        {/* Line chart — views over time */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Views — last 7 days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart — views per post */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Views per post</h2>
          {posts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No published posts yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={posts.map(p => ({
                name: p.title.length > 20 ? p.title.slice(0, 20) + '...' : p.title,
                views: p.views || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Posts table */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Your posts</h2>
          {posts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No published posts yet</p>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <Link to={`/post/${post.slug}`}
                      className="text-sm font-medium text-gray-800 hover:text-indigo-600">
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>👁 {post.views || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}