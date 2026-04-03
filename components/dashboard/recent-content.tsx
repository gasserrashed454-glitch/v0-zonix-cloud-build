'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FileTextIcon, ImageIcon, VideoIcon, FolderIcon, Clock } from 'lucide-react'
import type { File } from '@/lib/types'

interface RecentContentProps {
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

function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString()
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileTextIcon
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.startsWith('video/')) return VideoIcon
  return FileTextIcon
}

export function RecentContent({ files }: RecentContentProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
        <FolderIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-1">No recent files</h3>
        <p className="text-sm text-muted-foreground">
          Files you open or modify will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {files.map((file) => {
        const Icon = getFileIcon(file.mime_type)
        return (
          <Card key={file.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center p-4">
              <Icon className="h-12 w-12 text-primary/70 mb-2" />
              <span className="text-sm font-medium text-center truncate w-full">
                {file.name}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                {formatDate(file.updated_at)}
              </div>
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
