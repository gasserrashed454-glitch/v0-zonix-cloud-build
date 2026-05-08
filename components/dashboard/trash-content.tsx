'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileTextIcon, ImageIcon, VideoIcon, Trash2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import type { File } from '@/lib/types'

interface TrashContentProps {
  userId: string
  files: File[]
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileTextIcon
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.startsWith('video/')) return VideoIcon
  return FileTextIcon
}

export function TrashContent({ files: initialFiles }: TrashContentProps) {
  const [files, setFiles] = useState(initialFiles)

  const handleRestore = async (fileId: string) => {
    try {
      const res = await fetch('/api/files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, updates: { is_trashed: false } }),
      })

      if (res.ok) {
        setFiles(files.filter(f => f.id !== fileId))
        toast.success('File restored')
      }
    } catch {
      toast.error('Failed to restore file')
    }
  }

  const handlePermanentDelete = async (fileId: string) => {
    if (!confirm('Permanently delete this file? This cannot be undone.')) return

    try {
      const res = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds: [fileId], permanent: true }),
      })

      if (res.ok) {
        setFiles(files.filter(f => f.id !== fileId))
        toast.success('File permanently deleted')
      }
    } catch {
      toast.error('Failed to delete file')
    }
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
        <Trash2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-1">Trash is empty</h3>
        <p className="text-sm text-muted-foreground">
          Deleted files will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Files in trash will be automatically deleted after 30 days
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file) => {
          const Icon = getFileIcon(file.mime_type)
          return (
            <Card key={file.id} className="group relative hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center p-4">
                <Icon className="h-12 w-12 text-muted-foreground mb-2" />
                <span className="text-sm font-medium text-center truncate w-full">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" onClick={() => handleRestore(file.id)}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handlePermanentDelete(file.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
