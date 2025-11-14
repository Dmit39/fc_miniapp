'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'

interface ProfileHeaderProps {
  profile: {
    username: string
    display_name: string
    pfp_url?: string
    bio?: string
    follower_count: number
    following_count: number
  }
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <div className="relative h-32 bg-gradient-to-r from-primary/20 to-accent/20" />
      
      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
          {/* Profile Picture */}
          <div className="relative">
            {profile.pfp_url ? (
              <Image
                src={profile.pfp_url || "/placeholder.svg"}
                alt={profile.username}
                width={120}
                height={120}
                className="w-32 h-32 rounded-full border-4 border-card object-cover"
                unoptimized
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-card bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-1">{profile.display_name || profile.username}</h2>
            <p className="text-primary text-lg mb-3">@{profile.username}</p>
            {profile.bio && (
              <p className="text-muted-foreground line-clamp-2">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Follow Stats Summary */}
        <div className="flex gap-6">
          <div>
            <p className="text-muted-foreground text-sm">Followers</p>
            <p className="text-2xl font-bold text-primary">{profile.follower_count.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Following</p>
            <p className="text-2xl font-bold text-accent">{profile.following_count.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
