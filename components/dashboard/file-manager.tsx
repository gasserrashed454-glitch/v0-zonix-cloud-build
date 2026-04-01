'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { type File, type Folder, formatBytes, getFileIcon } from '@/lib/types'
import {
  Upload,
  FolderPlus,
  LayoutGrid,
  List,
  ChevronRight,
  MoreHorizontal,
  Star,
  Share2,
  Download,
  Trash2,
  FileIcon,
  FolderIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileIcon as DefaultFileIcon,
} from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

interface FileManagerProps {
  userId: string
  currentFolderId?: string | null
  initialFiles: File[]
  initialFolders: Folder[]
  breadcrumbs: { id: string | null; name: string }[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  file: DefaultFileIcon,
  image: ImageIcon,
  video: VideoIcon,
  doc: FileTextIcon,
  spreadsheet: FileSpreadsheetIcon,
  text: FileTextIcon,
}

export function FileManager({
  userId,
  currentFolderId,
  initialFiles,
  initialFolders,
  breadcrumbs,
}: FileManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

  const supabase = createClient()

  // Show upload dialog if action=upload in URL
  const showUploadDialog = searchParams.get('action') === 'upload'
  const showNewFolder = searchParams.get('action') === 'newfolder' || showNewFolderDialog

  const { data: filesData, mutate: mutateFiles } = useSWR(
    `files-${currentFolderId || 'root'}`,
    async () => {
      const { data } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .eq('is_trashed', false)
        .is('folder_id', currentFolderId || null)
        .order('created_at', { ascending: false })
      return data || []
    },
    { fallbackData: initialFiles }
  )

  const { data: foldersData, mutate: mutateFolders } = useSWR(
    `folders-${currentFolderId || 'root'}`,
    async () => {
      const { data } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .is('parent_id', currentFolderId || null)
        .order('name', { ascending: true })
      return data || []
    },
    { fallbackData: initialFolders }
  )

  const files = filesData || []
  const folders = foldersData || []

  const handleFileUpload = useCallback(async (fileList: FileList) => {
    setIsUploading(true)
    setUploadProgress(0)

    const totalFiles = fileList.length
    let uploaded = 0

    for (const file of Array.from(fileList)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        if (currentFolderId) {
          formData.append('folderId', currentFolderId)
        }

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        uploaded++
        setUploadProgress(Math.round((uploaded / totalFiles) * 100))
      } catch (error) {
        toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    setIsUploading(false)
    setUploadProgress(0)
    mutateFiles()
    toast.success(`Successfully uploaded ${uploaded} file${uploaded !== 1 ? 's' : ''}`)
    router.replace(`/dashboard/files${currentFolderId ? `/${currentFolderId}` : ''}`)
  }, [currentFolderId, mutateFiles, router])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    
    setIsCreatingFolder(true)
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolderId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create folder')
      }

      mutateFolders()
      setNewFolderName('')
      setShowNewFolderDialog(false)
      toast.success('Folder created successfully')
      router.replace(`/dashboard/files${currentFolderId ? `/${currentFolderId}` : ''}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create folder')
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleToggleFavorite = async (fileId: string, isFavorite: boolean) => {
    try {
      await supabase
        .from('files')
        .update({ is_favorite: !isFavorite })
        .eq('id', fileId)
      mutateFiles()
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
    } catch {
      toast.error('Failed to update favorite status')
    }
  }

  const handleMoveToTrash = async (fileId: string) => {
    try {
      await supabase
        .from('files')
        .update({ is_trashed: true, trashed_at: new Date().toISOString() })
        .eq('id', fileId)
      mutateFiles()
      toast.success('Moved to trash')
    } catch {
      toast.error('Failed to move to trash')
    }
  }

  const getIcon = (file: File) => {
    const iconType = getFileIcon(file.mime_type)
    const Icon = iconMap[iconType] || DefaultFileIcon
    return <Icon className="h-8 w-8 text-primary/70" />
  }

  return (
    <div 
      className="space-y-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.multiple = true
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files
                if (files) handleFileUpload(files)
              }
              input.click()
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewFolderDialog(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New folder
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id || 'root'} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium">{crumb.name}</span>
            ) : (
              <Link
                href={`/dashboard/files${crumb.id ? `/${crumb.id}` : ''}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Upload progress */}
      {isUploading && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <Spinner className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Uploading files...</p>
              <div className="mt-1 h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium">{uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Content */}
      {folders.length === 0 && files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FolderIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">This folder is empty</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here or click upload
          </p>
          <Button onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.multiple = true
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files
              if (files) handleFileUpload(files)
            }
            input.click()
          }}>
            <Upload className="h-4 w-4 mr-2" />
            Upload files
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Folders */}
          {folders.map((folder: Folder) => (
            <Link
              key={folder.id}
              href={`/dashboard/files/${folder.id}`}
              className="group flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-colors"
            >
              <FolderIcon className="h-12 w-12 text-primary/70 mb-2" />
              <span className="text-sm font-medium text-center truncate w-full">
                {folder.name}
              </span>
            </Link>
          ))}

          {/* Files */}
          {files.map((file: File) => (
            <div
              key={file.id}
              className="group relative flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-colors"
            >
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedItems.has(file.id)}
                  onCheckedChange={() => toggleSelect(file.id)}
                  className="opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleToggleFavorite(file.id, file.is_favorite)}>
                    <Star className={`h-4 w-4 mr-2 ${file.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    {file.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleMoveToTrash(file.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Move to trash
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {file.thumbnail_url ? (
                <img
                  src={file.thumbnail_url}
                  alt={file.name}
                  className="h-12 w-12 object-cover rounded mb-2"
                />
              ) : (
                <div className="mb-2">{getIcon(file)}</div>
              )}
              <span className="text-sm font-medium text-center truncate w-full">
                {file.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </span>
              {file.is_favorite && (
                <Star className="absolute bottom-2 right-2 h-3 w-3 fill-amber-400 text-amber-400" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {/* List view header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Modified</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Folders */}
          {folders.map((folder: Folder) => (
            <Link
              key={folder.id}
              href={`/dashboard/files/${folder.id}`}
              className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/50 transition-colors items-center"
            >
              <div className="col-span-6 flex items-center gap-3">
                <FolderIcon className="h-5 w-5 text-primary/70" />
                <span className="font-medium truncate">{folder.name}</span>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {new Date(folder.updated_at).toLocaleDateString()}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">--</div>
              <div className="col-span-2"></div>
            </Link>
          ))}

          {/* Files */}
          {files.map((file: File) => (
            <div
              key={file.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/50 transition-colors items-center group"
            >
              <div className="col-span-6 flex items-center gap-3">
                <Checkbox
                  checked={selectedItems.has(file.id)}
                  onCheckedChange={() => toggleSelect(file.id)}
                />
                {getIcon(file)}
                <span className="font-medium truncate">{file.name}</span>
                {file.is_favorite && (
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                )}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {new Date(file.updated_at).toLocaleDateString()}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {formatBytes(file.size)}
              </div>
              <div className="col-span-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleFavorite(file.id, file.is_favorite)}>
                      <Star className={`h-4 w-4 mr-2 ${file.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      {file.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleMoveToTrash(file.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Move to trash
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New folder dialog */}
      <Dialog open={showNewFolder} onOpenChange={(open) => {
        if (!open) {
          setShowNewFolderDialog(false)
          setNewFolderName('')
          router.replace(`/dashboard/files${currentFolderId ? `/${currentFolderId}` : ''}`)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder name</Label>
              <Input
                id="folderName"
                placeholder="My folder"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewFolderDialog(false)
                setNewFolderName('')
                router.replace(`/dashboard/files${currentFolderId ? `/${currentFolderId}` : ''}`)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={isCreatingFolder || !newFolderName.trim()}>
              {isCreatingFolder ? <Spinner className="mr-2" /> : null}
              Create folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
