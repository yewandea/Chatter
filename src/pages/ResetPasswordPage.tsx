import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-2">Reset your password</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and we'll send you a reset link.
        </p>
        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">📬</div>
            <p className="text-green-600 font-medium mb-2">Check your email!</p>
            <p className="text-gray-500 text-sm">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login"
              className="mt-6 inline-block text-indigo-600 hover:underline text-sm">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{error}</p>
            )}
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-6 text-center">
              Remember your password?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}