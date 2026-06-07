import { Link } from 'react-router-dom'

const features = [
  {
    icon: '✍️',
    title: 'Write beautifully',
    description: 'A distraction-free rich text editor with everything you need — headings, code blocks, images, and more.',
  },
  {
    icon: '📖',
    title: 'Read deeply',
    description: 'Long-form content designed for focus. No ads, no algorithmic noise — just great writing from real people.',
  },
  {
    icon: '🔍',
    title: 'Discover stories',
    description: 'Find posts by topic, tag, or author. A personalized feed that gets better the more you use it.',
  },
  {
    icon: '💬',
    title: 'Join the conversation',
    description: 'Like, comment, and follow the writers you love. Real-time discussions that feel alive.',
  },
  {
    icon: '📊',
    title: 'Understand your audience',
    description: 'A built-in analytics dashboard shows you who is reading, what they love, and how your writing grows.',
  },
  {
    icon: '🔒',
    title: 'Own your content',
    description: 'Your words, your profile, your data. Chatter is built on open standards with full data ownership.',
  },
]

export function SplashPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
        <span className="text-2xl font-bold text-indigo-600 tracking-tight">Chatter</span>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
          A new home for long-form writing
        </div>
        <h1 className="text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
          Where great ideas
          <br />
          <span className="text-indigo-600">find their words</span>
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
          Chatter is a publishing platform for writers and readers who prefer
          thoughtful, text-first content over short-form noise. Write, share, and
          grow your audience — without the distraction.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm">
            Start writing for free
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-xs text-gray-400 mt-8">
          No credit card required · Free to read and write
        </p>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-8">
        <div className="border-t border-gray-100"/>
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything a writer needs
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Built from the ground up for long-form content. No bloat, no distractions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(feature => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-8 pb-24">
        <div className="bg-indigo-600 rounded-3xl px-12 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to share your story?
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Join Chatter today and start writing for an audience that values depth.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors text-sm">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-indigo-600 font-bold text-lg">Chatter</span>
          <p className="text-xs text-gray-400">
            Built with React, Supabase, and Tailwind CSS · AltSchool Africa Capstone 2026
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link to="/login" className="hover:text-gray-600">Sign in</Link>
            <Link to="/register" className="hover:text-gray-600">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}