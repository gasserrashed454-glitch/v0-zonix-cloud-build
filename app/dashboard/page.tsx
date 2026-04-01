import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatBytes, type Profile, type File } from '@/lib/types'
import Link from 'next/link'
import { 
  Files, 
  Upload, 
  FolderPlus, 
  Clock, 
  Star, 
  Share2, 
  HardDrive,
  Sparkles,
  ArrowRight
} from 'lucide-react'

async function getRecentFiles(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)
    .eq('is_trashed', false)
    .order('updated_at', { ascending: false })
    .limit(6)
  return data || []
}

async function getStats(userId: string) {
  const supabase = await createClient()
  
  const [filesResult, favoritesResult, sharedResult] = await Promise.all([
    supabase.from('files').select('id', { count: 'exact' }).eq('user_id', userId).eq('is_trashed', false),
    supabase.from('files').select('id', { count: 'exact' }).eq('user_id', userId).eq('is_favorite', true),
    supabase.from('shared_files').select('id', { count: 'exact' }).eq('shared_by', userId),
  ])

  return {
    totalFiles: filesResult.count || 0,
    favorites: favoritesResult.count || 0,
    shared: sharedResult.count || 0,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const [recentFiles, stats] = await Promise.all([
    getRecentFiles(user.id),
    getStats(user.id),
  ])

  const quickActions = [
    { title: 'Upload files', icon: Upload, href: '/dashboard/files?action=upload' },
    { title: 'New folder', icon: FolderPlus, href: '/dashboard/files?action=newfolder' },
    { title: 'AI Assistant', icon: Sparkles, href: '/dashboard/ai' },
  ]

  const storagePercent = Math.round((profile.storage_used / profile.storage_limit) * 100)

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your files today.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Button key={action.title} variant="outline" asChild>
            <Link href={action.href}>
              <action.icon className="h-4 w-4 mr-2" />
              {action.title}
            </Link>
          </Button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(profile.storage_used)}</div>
            <p className="text-xs text-muted-foreground">
              of {formatBytes(profile.storage_limit)} ({storagePercent}%)
            </p>
            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
            <Files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">files in your cloud</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorites}</div>
            <p className="text-xs text-muted-foreground">starred items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shared</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shared}</div>
            <p className="text-xs text-muted-foreground">shared files</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Files</CardTitle>
            <CardDescription>Your recently accessed files</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/recent">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Files className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No files yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your first file to get started
              </p>
              <Button asChild>
                <Link href="/dashboard/files?action=upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload files
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {recentFiles.map((file: File) => (
                <Link
                  key={file.id}
                  href={`/dashboard/files/${file.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <Files className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Assistant promo */}
      {profile.tier === 'free' && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI-Powered Features</CardTitle>
            </div>
            <CardDescription>
              Let AI organize your files, suggest tags, and help you find what you need faster.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/ai">
                  Try AI Assistant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pricing">Upgrade for more AI features</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
