import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { Button } from '../ui/Button.jsx'

export function RichTextEditor({ value, onChange, placeholder = 'Tulis konten...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
    onUpdate({ editor: instance }) {
      onChange(instance.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullet
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
