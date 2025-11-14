'use client'

import { useState, useEffect } from 'react'
import ProfileStatsDisplay from '@/components/profile-stats-display'
import ProfileInput from '@/components/profile-input'

export default function Home() {
  const [username, setUsername] = useState<string>('')
  const [showStats, setShowStats] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeFrame = async () => {
      try {
        console.log('[v0] Starting miniapp SDK initialization...')
        
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
        console.log('[v0] SDK imported, calling ready()')
        await sdk.actions.ready()
        console.log('[v0] SDK ready() called successfully')

        // Get context
        const context = sdk.context
        console.log('[v0] SDK context:', context)
        console.log('[v0] User from context:', context?.user)

        let frameUsername = null
        if (context?.user?.username) {
          frameUsername = context.user.username
        } else if (context?.user?.fid) {
          // If we have FID but no username, we could use that too
          console.log('[v0] Got FID from context:', context.user.fid)
        }

        if (frameUsername) {
          console.log('[v0] Auto-loading profile for user:', frameUsername)
          setUsername(frameUsername)
          setShowStats(true)
        } else {
          console.log('[v0] No user context available, will show input form')
        }
      } catch (error) {
        console.log('[v0] Error initializing SDK:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeFrame()

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

        <ProfileInput onLoadProfile={(user) => {
          setUsername(user)
          setShowStats(true)
        }} />
      </div>
    </main>
  )
}
