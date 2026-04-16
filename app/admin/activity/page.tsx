import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Upload, Download, Trash2, Share2, LogIn, UserPlus, Settings } from 'lucide-react'

const actionIcons: Record<string, React.ElementType> = {
  file_upload: Upload,
  file_download: Download,
  file_delete: Trash2,
  file_share: Share2,
  login: LogIn,
  signup: UserPlus,
  settings_update: Settings,
}

const actionColors: Record<string, string> = {
  file_upload: 'bg-green-100 text-green-700',
  file_download: 'bg-blue-100 text-blue-700',
  file_delete: 'bg-red-100 text-red-700',
  file_share: 'bg-purple-100 text-purple-700',
  login: 'bg-gray-100 text-gray-700',
  signup: 'bg-emerald-100 text-emerald-700',
  settings_update: 'bg-orange-100 text-orange-700',
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminActivityPage() {
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from('activity_logs')
    .select('*, profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground">Monitor all user activities across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Showing the last 100 activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = actionIcons[activity.action] || Activity
                const colorClass = actionColors[activity.action] || 'bg-gray-100 text-gray-700'
                const profile = activity.profiles as { email: string; full_name: string | null } | null
                
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {profile?.full_name || profile?.email || 'Unknown User'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.action.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {activity.details && (
                        <p className="text-sm text-muted-foreground truncate">
                          {JSON.stringify(activity.details)}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{activity.ip_address || 'Unknown IP'}</span>
                        {activity.location && <span>{activity.location}</span>}
                        <span>{formatDate(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No activity logs yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
