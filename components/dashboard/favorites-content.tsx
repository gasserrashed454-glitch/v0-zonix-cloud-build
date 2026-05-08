'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileTextIcon, ImageIcon, VideoIcon, Star, FolderIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { File } from '@/lib/types'

interface FavoritesContentProps {
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

export function FavoritesContent({ files: initialFiles }: FavoritesContentProps) {
  const [files, setFiles] = useState(initialFiles)

  const handleRemoveFavorite = async (fileId: string) => {
    try {
      const res = await fetch('/api/files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, updates: { is_favorite: false } }),
      })

      if (res.ok) {
        setFiles(files.filter(f => f.id !== fileId))
        toast.success('Removed from favorites')
      }
    } catch {
      toast.error('Failed to update')
    }
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
        <FolderIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-1">No favorites yet</h3>
        <p className="text-sm text-muted-foreground">
          Star files to add them to your favorites
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {files.map((file) => {
        const Icon = getFileIcon(file.mime_type)
        return (
          <Card key={file.id} className="group relative hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center p-4">
              <button
                onClick={() => handleRemoveFavorite(file.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star className="h-4 w-4 fill-amber-400 text-amber-400 hover:fill-amber-300" />
              </button>
              <Icon className="h-12 w-12 text-primary/70 mb-2" />
              <span className="text-sm font-medium text-center truncate w-full">
                {file.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
