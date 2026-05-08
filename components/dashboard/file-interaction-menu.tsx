'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { type File } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Eye,
  Share2,
  Star,
  Download,
  Trash2,
  Copy,
  Mail,
  Link as LinkIcon,
  AlertTriangle,
} from 'lucide-react'

interface FileInteractionMenuProps {
  file: File | null
  isOpen: boolean
  onClose: () => void
  onView?: (file: File) => void
  onFavorite?: (file: File) => Promise<void>
  onDownload?: (file: File) => void
  onDelete?: (file: File) => Promise<void>
  onRefresh?: () => Promise<void>
}

type MenuStep = 'main' | 'share' | 'delete-confirm'

export function FileInteractionMenu({
  file,
  isOpen,
  onClose,
  onView,
  onFavorite,
  onDownload,
  onDelete,
  onRefresh,
}: FileInteractionMenuProps) {
  const [step, setStep] = useState<MenuStep>('main')
  const [isLoading, setIsLoading] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [expiresIn, setExpiresIn] = useState<string>('30days')
  const [shareLink, setShareLink] = useState<string>('')
  const [shareCode, setShareCode] = useState<string>('')

  if (!file) return null

  const handleClose = () => {
    setStep('main')
    setShareEmail('')
    setExpiresIn('30days')
    setShareLink('')
    setShareCode('')
    onClose()
  }

  const handleView = () => {
    if (onView) {
      onView(file)
      handleClose()
    }
  }

  const handleFavorite = async () => {
    if (!onFavorite) return
    setIsLoading(true)
    try {
      await onFavorite(file)
      toast.success(file.is_favorite ? 'Removed from favorites' : 'Added to favorites')
      handleClose()
    } catch (error) {
      toast.error('Failed to update favorite status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file)
      handleClose()
    }
  }

  const handleShare = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/files/share-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: file.id,
          expiresIn: expiresIn === 'never' ? null : expiresIn,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      setShareLink(data.shareUrl)
      setShareCode(data.shareCode)

      // Auto-copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl)
      toast.success('Share link copied to clipboard!')
    } catch (error) {
      console.error('[v0] Share error:', error)
      toast.error('Failed to generate share link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailShare = async () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/files/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: file.id,
          shared_with_email: shareEmail,
          permission: 'view',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to share via email')
      }

      toast.success(`File shared with ${shareEmail}`)
      setShareEmail('')
      setStep('main')
    } catch (error) {
      console.error('[v0] Email share error:', error)
      toast.error('Failed to share via email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsLoading(true)
    try {
      await onDelete(file)
      toast.success('File moved to trash')
      handleClose()
    } catch (error) {
      toast.error('Failed to delete file')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {/* Main Menu */}
        {step === 'main' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {file.name.split('.').pop()?.toUpperCase().slice(0, 2)}
                  </span>
                </div>
                File Options
              </DialogTitle>
              <DialogDescription>{file.name}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 py-4">
              {/* View Option */}
              <button
                onClick={handleView}
                disabled={isLoading}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium">View</span>
                <span className="text-xs text-muted-foreground">Open in viewer</span>
              </button>

              {/* Share Option */}
              <button
                onClick={() => setStep('share')}
                disabled={isLoading}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium">Share</span>
                <span className="text-xs text-muted-foreground">Generate link</span>
              </button>

              {/* Favorite Option */}
              <button
                onClick={handleFavorite}
                disabled={isLoading}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Star
                    className={`w-5 h-5 ${
                      file.is_favorite
                        ? 'fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  />
                </div>
                <span className="text-sm font-medium">
                  {file.is_favorite ? 'Unfavorite' : 'Favorite'}
                </span>
                <span className="text-xs text-muted-foreground">Mark as favorite</span>
              </button>

              {/* Download Option */}
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium">Download</span>
                <span className="text-xs text-muted-foreground">Save to device</span>
              </button>

              {/* Delete Option */}
              <button
                onClick={() => setStep('delete-confirm')}
                disabled={isLoading}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-transparent hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-200 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium">Delete</span>
                <span className="text-xs text-muted-foreground">Move to trash</span>
              </button>
            </div>
          </>
        )}

        {/* Share Menu */}
        {step === 'share' && (
          <>
            <DialogHeader>
              <DialogTitle>Share File</DialogTitle>
              <DialogDescription>Create a link or share via email</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Generate Link Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <Label className="font-semibold">Create Shareable Link</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires">Link Expires</Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1hour">1 Hour</SelectItem>
                      <SelectItem value="1day">1 Day</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleShare}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && <Spinner className="mr-2" />}
                  {shareLink ? 'Generate New Link' : 'Generate Link'}
                </Button>

                {shareLink && (
                  <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Share Code:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-background px-3 py-2 rounded font-mono break-all">
                        {shareCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(shareCode)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Share Link:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-background px-3 py-2 rounded font-mono break-all">
                        {shareLink}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(shareLink)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                {/* Email Share Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Label className="font-semibold">Share via Email</Label>
                  </div>

                  <Input
                    type="email"
                    placeholder="recipient@example.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEmailShare()
                    }}
                  />

                  <Button
                    onClick={handleEmailShare}
                    disabled={isLoading || !shareEmail.trim()}
                    className="w-full"
                  >
                    {isLoading && <Spinner className="mr-2" />}
                    Send Email Invite
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('main')}>
                Back
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Delete Confirmation */}
        {step === 'delete-confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Confirm Delete
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to move <strong>{file.name}</strong> to trash? You can recover it
                within 30 days.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('main')} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading && <Spinner className="mr-2" />}
                Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
