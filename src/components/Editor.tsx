import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface EditorProps {
  content: string
  onChange: (html: string, text: string) => void
}

export function Editor({ content, onChange }: EditorProps) {
  const { user } = useAuth()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        blockquote: {},
        codeBlock: {},
      }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Tell your story...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText())
    },
  })

  if (!editor) return null

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (error) { alert('Image upload failed'); return }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(data.path)

    editor.chain().focus().setImage({ src: publicUrl }).run()
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          label="B"
          className="font-bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          label="I"
          className="italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          label="H1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          label="H2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          label="<>"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          label="• List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          label='" Quote'
        />
        <label className="cursor-pointer px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700">
          📷 Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* Editor styles */}
      <style>{`
        .tiptap { outline: none; }
        .tiptap h1 { font-size: 2em; font-weight: bold; margin: 0.5em 0; }
        .tiptap h2 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
        .tiptap p { margin: 0.5em 0; }
        .tiptap ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap blockquote { border-left: 3px solid #e5e7eb; padding-left: 1em; color: #6b7280; margin: 0.5em 0; }
        .tiptap pre { background: #f3f4f6; border-radius: 6px; padding: 0.75em 1em; font-family: monospace; margin: 0.5em 0; }
        .tiptap code { background: #f3f4f6; border-radius: 3px; padding: 0.1em 0.3em; font-family: monospace; }
        .tiptap p.is-editor-empty:first-child::before { color: #adb5bd; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="p-4 min-h-[400px]"
      />
    </div>
  )
}

function ToolbarButton({ onClick, active, label, className = '' }: {
  onClick: () => void
  active: boolean
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'border-gray-300 hover:bg-gray-100 text-gray-700'
      } ${className}`}
    >
      {label}
    </button>
  )
}