'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ProfileHeader from './profile-header'
import StatsGrid from './stats-grid'

interface ProfileStatsDisplayProps {
  username: string
  onBack: () => void
}

interface FarcasterProfile {
  fid: number
  username: string
  display_name: string
  pfp_url?: string
  bio?: string
  follower_count: number
  following_count: number
  profile_created_at: string
  viewer_context?: {
    follow_state: string
  }
  viewer_neynar_score?: number
  spam_label?: {
    unspam_count: number
    spam_count: number
  }
}

export default function ProfileStatsDisplay({ username, onBack }: ProfileStatsDisplayProps) {
  const [profile, setProfile] = useState<FarcasterProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Fetch from Neynar API
        const response = await fetch(
          `/api/farcaster-profile?username=${encodeURIComponent(username)}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground">Loading profile data...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm text-center">
        <p className="text-destructive mb-4">{error || 'Profile not found'}</p>
        <Button onClick={onBack} variant="outline">
          Try Another Profile
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} />
      <StatsGrid profile={profile} />
      
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onBack} 
          variant="outline"
          className="border-border/50 hover:bg-muted"
        >
          Search Another Profile
        </Button>
      </div>
    </div>
  )
}
