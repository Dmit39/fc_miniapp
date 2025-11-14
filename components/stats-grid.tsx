'use client'

import StatCard from './stat-card'

interface StatsGridProps {
  profile: {
    fid: number
    profile_created_at: string
    follower_count: number
    following_count: number
    spam_label?: {
      spam_count: number
      unspam_count: number
    }
  }
}

export default function StatsGrid({ profile }: StatsGridProps) {
  const createdDate = new Date(profile.profile_created_at)
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const spamScore = profile.spam_label ? profile.spam_label.spam_count : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        label="Farcaster ID"
        value={profile.fid.toString()}
        icon="🆔"
        gradient="from-primary/20 to-primary/10"
      />
      
      <StatCard
        label="Profile Created"
        value={formattedDate}
        icon="📅"
        gradient="from-accent/20 to-accent/10"
      />
      
      <StatCard
        label="Followers"
        value={profile.follower_count.toLocaleString()}
        icon="👥"
        gradient="from-primary/20 to-accent/20"
      />
      
      <StatCard
        label="Following"
        value={profile.following_count.toLocaleString()}
        icon="➡️"
        gradient="from-accent/20 to-primary/20"
      />
      
      <StatCard
        label="Spam Label"
        value={spamScore.toString()}
        icon="🚨"
        gradient="from-red-500/20 to-red-500/10"
      />
    </div>
  )
}
