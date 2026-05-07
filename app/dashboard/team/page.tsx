'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Trash2, Edit2, Share2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface TeamMember {
  id: string
  email: string
  full_name?: string
  role: 'owner' | 'admin' | 'member'
  allocated_storage: number
  used_storage: number
  joined_at: string
}

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberStorage, setNewMemberStorage] = useState('100')
  const [totalStorage] = useState(250) // 250GB for Premium tier
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const supabase = createClient()

  // Load team members on mount and set up real-time subscription
  useEffect(() => {
    loadTeamMembers()
    subscribeToChanges()
  }, [])

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('Not authenticated')
        return
      }

      // Fetch team members from database
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading team members:', error)
        toast.error('Failed to load team members')
        return
      }

      setTeamMembers(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load team members')
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToChanges = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    supabase
      .channel(`team-members-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
          filter: `team_owner_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[v0] Team members changed:', payload)
          loadTeamMembers()
        }
      )
      .subscribe()
  }

  const usedStorage = teamMembers.reduce((sum, m) => sum + m.used_storage, 0)
  const allocatedStorage = teamMembers.reduce((sum, m) => sum + m.allocated_storage, 0)
  const availableStorage = totalStorage - allocatedStorage

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error('Email is required')
      return
    }

    const storageAmount = parseInt(newMemberStorage)
    if (storageAmount > availableStorage) {
      toast.error(`Only ${availableStorage}GB available`)
      return
    }

    setIsAdding(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      // Add team member to database
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_owner_id: user.id,
          email: newMemberEmail,
          allocated_storage: storageAmount,
          used_storage: 0,
          role: 'member',
        })

      if (error) {
        console.error('Error adding member:', error)
        toast.error(error.message)
        return
      }

      toast.success('Team member added')
      setNewMemberEmail('')
      setNewMemberStorage('100')
      setShowAddMember(false)
      await loadTeamMembers()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to add team member')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) {
        toast.error('Failed to remove member')
        return
      }

      toast.success('Member removed')
      await loadTeamMembers()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to remove member')
    }
  }

  const handleUpdateStorage = async (memberId: string, newAllocation: number) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    const difference = newAllocation - member.allocated_storage
    if (difference > availableStorage) {
      toast.error(`Only ${availableStorage}GB available`)
      return
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ allocated_storage: newAllocation })
        .eq('id', memberId)

      if (error) {
        toast.error('Failed to update allocation')
        return
      }

      toast.success('Storage allocation updated')
      await loadTeamMembers()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update allocation')
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage team members and storage allocation in real-time</p>
        </div>

        {/* Storage Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Storage</p>
                <p className="text-2xl font-bold">{totalStorage}GB</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Allocated</p>
                <p className="text-2xl font-bold">{allocatedStorage}GB</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-primary">{availableStorage}GB</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(allocatedStorage / totalStorage) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {allocatedStorage}GB of {totalStorage}GB used
            </p>
          </CardContent>
        </Card>

        {/* Add Member Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Add Team Member</CardTitle>
                <CardDescription>Invite a new member to your team</CardDescription>
              </div>
              <Button onClick={() => setShowAddMember(!showAddMember)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          {showAddMember && (
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    placeholder="member@example.com"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Storage Allocation (GB)</label>
                  <Input
                    placeholder="100"
                    type="number"
                    max={availableStorage}
                    value={newMemberStorage}
                    onChange={(e) => setNewMemberStorage(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMember} disabled={isAdding}>
                  {isAdding ? 'Adding...' : 'Add Member'}
                </Button>
                <Button onClick={() => setShowAddMember(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
            <CardDescription>
              Manage your team and their storage allocations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading team members...
              </div>
            ) : teamMembers.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No team members yet</AlertTitle>
                <AlertDescription>
                  Add your first team member above to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium">{member.email}</h3>
                      <p className="text-sm text-muted-foreground">
                        {member.used_storage}GB used of {member.allocated_storage}GB allocated
                      </p>
                      <div className="mt-2 h-1 bg-muted rounded-full w-full">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${member.allocated_storage > 0 ? (member.used_storage / member.allocated_storage) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline">{member.role}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newAlloc = prompt(`New allocation (current: ${member.allocated_storage}GB):`)
                          if (newAlloc) {
                            handleUpdateStorage(member.id, parseInt(newAlloc))
                          }
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Storage Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Storage</p>
                <p className="text-2xl font-bold">{totalStorage}GB</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Allocated</p>
                <p className="text-2xl font-bold">{allocatedStorage}GB</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableStorage}GB</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all" 
                style={{ width: `${(allocatedStorage / totalStorage) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              {((allocatedStorage / totalStorage) * 100).toFixed(1)}% of storage allocated
            </p>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>Manage who has access and their storage</CardDescription>
            </div>
            <Button onClick={() => setShowAddMember(!showAddMember)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Member Form */}
            {showAddMember && (
              <div className="p-4 border rounded-lg space-y-3">
                <Input
                  placeholder="team@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Storage (GB)"
                    value={newMemberStorage}
                    onChange={(e) => setNewMemberStorage(e.target.value)}
                    max={availableStorage}
                  />
                  <Button onClick={handleAddMember}>Add</Button>
                  <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(member.usedStorage / member.allocatedStorage) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {member.usedStorage}GB / {member.allocatedStorage}GB
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={member.role === 'Owner' ? 'default' : 'outline'}>
                      {member.role}
                    </Badge>
                    {member.role !== 'Owner' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newAlloc = prompt(`New allocation (GB):`, member.allocatedStorage.toString())
                            if (newAlloc) handleUpdateStorage(member.id, parseInt(newAlloc))
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
