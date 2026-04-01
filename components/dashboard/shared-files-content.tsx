'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FileTextIcon, ImageIcon, VideoIcon, FolderIcon } from 'lucide-react'
import type { File } from '@/lib/types'

interface SharedFilesContentProps {
  files: Array<{ files: File | null }>
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

export function SharedFilesContent({ files }: SharedFilesContentProps) {
  const sharedFiles = files.map(f => f.files).filter((f): f is File => f !== null)

  if (sharedFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
        <FolderIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-1">No shared files</h3>
        <p className="text-sm text-muted-foreground">
          Files shared with you will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {sharedFiles.map((file) => {
        const Icon = getFileIcon(file.mime_type)
        return (
          <Card key={file.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center p-4">
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
