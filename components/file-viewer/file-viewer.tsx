'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import {
  Download,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'

interface FileViewerProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  filePathname: string
  fileName: string
  mimeType: string
}

export function FileViewer({ isOpen, onClose, fileId, filePathname, fileName, mimeType }: FileViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Construct the serve URL
  const fileUrl = filePathname ? `/api/files/serve?pathname=${encodeURIComponent(filePathname)}` : ''

  const getFileType = () => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType.startsWith('text/') || mimeType === 'application/json') return 'text'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
    return 'unknown'
  }

  const fileType = getFileType()

  const handleDownload = async () => {
    try {
      if (!fileUrl) throw new Error('File URL not available')
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'File not found' : 'Download failed')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Download started')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download file'
      console.error('[v0] Download error:', message)
      setError(message)
      toast.error(message)
    }
  }

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground text-center">{error}</p>
          <Button variant="outline" onClick={handleDownload}>
            Download Instead
          </Button>
        </div>
      )
    }

    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No file path available</p>
        </div>
      )
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-full max-w-full"
              style={{ transform: `scale(${zoom / 100})` }}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                const msg = 'Failed to load image'
                setError(msg)
                setIsLoading(false)
                toast.error(msg)
              }}
            />
          </div>
        )
      case 'pdf':
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              PDF viewer requires pdf.js integration. Download to view externally.
            </p>
          </div>
        )
      case 'text':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              const msg = 'Failed to load text file'
              setError(msg)
              setIsLoading(false)
            }}
          />
        )
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Preview not available for this file type. Download to open.
            </p>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="truncate">{fileName}</DialogTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            {fileType === 'image' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{zoom}%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-black/50 flex items-center justify-center min-h-[400px]">
          {isLoading && fileType !== 'text' && (
            <Spinner className="text-white" />
          )}
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
