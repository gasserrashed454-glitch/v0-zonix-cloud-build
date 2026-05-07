'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Trash2, Edit2, Share2 } from 'lucide-react'
import { toast } from 'sonner'

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'You', email: 'user@example.com', role: 'Owner', allocatedStorage: 500, usedStorage: 120 }
  ])
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberStorage, setNewMemberStorage] = useState('100')
  const [totalStorage] = useState(1000) // 1TB for Business tier

  const usedStorage = teamMembers.reduce((sum, m) => sum + m.usedStorage, 0)
  const allocatedStorage = teamMembers.reduce((sum, m) => sum + m.allocatedStorage, 0)
  const availableStorage = totalStorage - allocatedStorage

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) {
      toast.error('Email is required')
      return
    }
    if (parseInt(newMemberStorage) > availableStorage) {
      toast.error(`Only ${availableStorage}GB available`)
      return
    }

    const newMember = {
      id: teamMembers.length + 1,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: 'Member',
      allocatedStorage: parseInt(newMemberStorage),
      usedStorage: 0
    }
    setTeamMembers([...teamMembers, newMember])
    toast.success('Team member added')
    setNewMemberEmail('')
    setNewMemberStorage('100')
    setShowAddMember(false)
  }

  const handleDeleteMember = (id: number) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id))
    toast.success('Member removed')
  }

  const handleUpdateStorage = (id: number, newAllocation: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    const difference = newAllocation - member.allocatedStorage
    if (difference > availableStorage) {
      toast.error(`Only ${availableStorage}GB available`)
      return
    }

    setTeamMembers(teamMembers.map(m => 
      m.id === id ? { ...m, allocatedStorage: newAllocation } : m
    ))
    toast.success('Storage allocation updated')
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage team members and storage allocation</p>
        </div>

        {/* Storage Overview */}
        <Card>
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
