import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
  social_links: Record<string, string>
  created_at: string
}

interface Post {
  id: string
  title: string
  slug: string
  reading_time: number
  published_at: string
  views: number
  tags: string[]
}

export function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (!profileData) { navigate('/feed'); return }
    setProfile(profileData)
    setBio(profileData.bio || '')
    setFullName(profileData.full_name || '')
    setIsOwner(user?.id === profileData.id)

    const { data: postsData } = await supabase
      .from('posts')
      .select('id, title, slug, reading_time, published_at, views, tags')
      .eq('author_id', profileData.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (postsData) setPosts(postsData)

    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileData.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileData.id),
    ])
    setFollowerCount(followers || 0)
    setFollowingCount(following || 0)

    if (user && user.id !== profileData.id) {
      const { data: followData } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', profileData.id)
        .single()
      setIsFollowing(!!followData)
    }

    setLoading(false)
  }

  const toggleFollow = async () => {
    if (!user || !profile) return
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id).eq('following_id', profile.id)
      setIsFollowing(false)
      setFollowerCount(c => c - 1)
    } else {
      await supabase.from('follows').insert({
        follower_id: user.id, following_id: profile.id
      })
      setIsFollowing(true)
      setFollowerCount(c => c + 1)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
    if (error) { alert('Upload failed'); return }
    const { data: { publicUrl } } = supabase.storage
      .from('avatars').getPublicUrl(data.path)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles')
      .update({ bio, full_name: fullName })
      .eq('id', user.id)
    setProfile(prev => prev ? { ...prev, bio, full_name: fullName } : null)
    setSaving(false)
    setEditing(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link to="/feed" className="text-xl font-bold text-indigo-600">Chatter</Link>
        <Link to="/feed" className="text-sm text-gray-500 hover:text-gray-800">← Back to feed</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover"/>
                  ) : (
                    profile.username[0].toUpperCase()
                  )}
                </div>
                {isOwner && (
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700">
                    <span className="text-white text-xs">+</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload}/>
                  </label>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                {profile.full_name && (
                  <p className="text-gray-500 text-sm">{profile.full_name}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span><strong className="text-gray-900">{followerCount}</strong> followers</span>
                  <span><strong className="text-gray-900">{followingCount}</strong> following</span>
                  <span><strong className="text-gray-900">{posts.length}</strong> posts</span>
                </div>
              </div>
            </div>
            {isOwner ? (
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {editing ? 'Cancel' : 'Edit profile'}
              </button>
            ) : (
              <button
                onClick={toggleFollow}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  isFollowing
                    ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Bio */}
          {editing ? (
            <div className="mt-6 space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Write a short bio..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          ) : (
            profile.bio && (
              <p className="mt-4 text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
            )
          )}
        </div>

        {/* Posts */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Published posts</h2>
        {posts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
            No published posts yet.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link key={post.id} to={`/post/${post.slug}`}>
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {post.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>{post.reading_time} min read</span>
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}