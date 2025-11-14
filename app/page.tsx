'use client'

import { useState, useEffect } from 'react'
import ProfileStatsDisplay from '@/components/profile-stats-display'
import ProfileInput from '@/components/profile-input'

declare global {
  interface Window {
    farcasterFrame?: {
      sdk: {
        actions: {
          ready: () => void
        }
      }
    }
  }
}

export default function Home() {
  const [username, setUsername] = useState<string>('')
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    const initializeFrame = async () => {
      try {
        // Check if running in Farcaster context
        if (typeof window !== 'undefined' && window.farcasterFrame?.sdk?.actions?.ready) {
          window.farcasterFrame.sdk.actions.ready()
          console.log('[v0] Farcaster Frame SDK ready called successfully')
        }
      } catch (error) {
        console.log('[v0] Frame context not available, running as standalone app')
      }
    }

    // Small delay to ensure SDK script is loaded
    const timer = setTimeout(initializeFrame, 100)

    // Try to get username from URL parameters
    const params = new URLSearchParams(window.location.search)
    const urlUsername = params.get('user')
    if (urlUsername) {
      setUsername(urlUsername)
      setShowStats(true)
    }

    return () => clearTimeout(timer)
  }, [])

  const handleLoadProfile = (user: string) => {
    setUsername(user)
    setShowStats(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">⬇</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              Farcaster Stats
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">View your profile statistics and analytics</p>
        </div>

        {!showStats ? (
          <ProfileInput onLoadProfile={handleLoadProfile} />
        ) : (
          <ProfileStatsDisplay username={username} onBack={() => setShowStats(false)} />
        )}
      </div>
    </main>
  )
}
