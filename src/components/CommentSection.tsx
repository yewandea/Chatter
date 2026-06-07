import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

interface Comment {
  id: string
  body: string
  created_at: string
  author_id: string
  parent_id: string | null
  profiles: { username: string }
  replies?: Comment[]
}

interface Props {
  postId: string
}

export function CommentSection({ postId }: Props) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!comments_author_id_fkey(username)')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    if (!data) return

    const { data: replies } = await supabase
      .from('comments')
      .select('*, profiles!comments_author_id_fkey(username)')
      .eq('post_id', postId)
      .not('parent_id', 'is', null)
      .order('created_at', { ascending: true })

    const commentsWithReplies = data.map(comment => ({
      ...comment,
      replies: replies?.filter(r => r.parent_id === comment.id) || []
    }))

    setComments(commentsWithReplies as Comment[])
  }

  useEffect(() => {
    fetchComments()

    // Realtime subscription
    const channel = supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      }, () => {
        fetchComments()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [postId])

  const submitComment = async () => {
  if (!user || !newComment.trim()) return
  setLoading(true)
  const { data } = await supabase.from('comments').insert({
    post_id: postId,
    author_id: user.id,
    body: newComment.trim(),
    parent_id: null
  }).select('*, posts(author_id, title)').single()

  // Notify post author
  if (data?.posts) {
    const post = data.posts as any
    if (post.author_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: post.author_id,
        type: 'comment',
        ref_id: postId,
        message: `Someone commented on your post "${post.title}"`
      })
    }
  }

  setNewComment('')
  setLoading(false)
}

  const submitReply = async (parentId: string) => {
    if (!user || !replyText.trim()) return
    setLoading(true)
    await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      body: replyText.trim(),
      parent_id: parentId
    })
    setReplyText('')
    setReplyTo(null)
    setLoading(false)
  }

  const deleteComment = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId)
    fetchComments()
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h3>

      {/* New comment input */}
      {user && (
        <div className="mb-8">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={submitComment}
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">
            No comments yet. Be the first!
          </p>
        )}
        {comments.map(comment => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              currentUserId={user?.id}
              onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              onDelete={() => deleteComment(comment.id)}
            />

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                {comment.replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={user?.id}
                    onDelete={() => deleteComment(reply.id)}
                  />
                ))}
              </div>
            )}

            {/* Reply input */}
            {replyTo === comment.id && (
              <div className="ml-8 mt-3">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setReplyTo(null)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitReply(comment.id)}
                    disabled={loading || !replyText.trim()}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CommentItem({ comment, currentUserId, onReply, onDelete }: {
  comment: Comment
  currentUserId?: string
  onReply?: () => void
  onDelete: () => void
}) {
  const author = comment.profiles as any
  const date = new Date(comment.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700 shrink-0">
        {author?.username?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Link to={`/profile/${author?.username}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600">
  {author?.username}
</Link>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>
        <div className="flex gap-3 mt-1">
          {onReply && (
            <button onClick={onReply}
              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">
              Reply
            </button>
          )}
          {currentUserId === comment.author_id && (
            <button onClick={onDelete}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}