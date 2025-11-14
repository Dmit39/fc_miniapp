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
        context: {
          user?: {
            username: string
            fid: number
          }
        }
      }
    }
  }
}

export default function Home() {
  const [username, setUsername] = useState<string>('')
  const [showStats, setShowStats] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeFrame = async () => {
      try {
        console.log('[v0] Initializing Farcaster Frame...')
        
        // Call ready immediately
        if (typeof window !== 'undefined' && window.farcasterFrame?.sdk?.actions?.ready) {
          window.farcasterFrame.sdk.actions.ready()
          console.log('[v0] Farcaster Frame SDK ready called')
        }

        // Small delay to ensure SDK context is available
        await new Promise(resolve => setTimeout(resolve, 100))

        // Check if we have user context from Farcaster
        const userContext = window.farcasterFrame?.sdk?.context?.user
        console.log('[v0] User context:', userContext)
        
        if (userContext?.username) {
          console.log('[v0] Auto-loading profile for:', userContext.username)
          setUsername(userContext.username)
          setShowStats(true)
        } else {
          console.log('[v0] No user context found, showing input form')
        }
      } catch (error) {
        console.log('[v0] Error initializing Frame:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeFrame()

    // Also check URL parameters as fallback
    const params = new URLSearchParams(window.location.search)
    const urlUsername = params.get('user')
    if (urlUsername) {
      console.log('[v0] Loading profile from URL param:', urlUsername)
      setUsername(urlUsername)
      setShowStats(true)
      setIsLoading(false)
    }
  }, [])

  const handleLoadProfile = (user: string) => {
    console.log('[v0] Loading profile:', user)
    setUsername(user)
    setShowStats(true)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Initializing app...</p>
        </div>
      </main>
    )
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
