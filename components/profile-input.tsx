'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface ProfileInputProps {
  onLoadProfile: (username: string) => void
}

export default function ProfileInput({ onLoadProfile }: ProfileInputProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] Form submitted with input:', input)
    
    if (!input.trim()) {
      setError('Please enter a username')
      return
    }
    
    setError('')
    setIsLoading(true)
    console.log('[v0] Calling onLoadProfile with:', input.trim())
    onLoadProfile(input.trim())
  }

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true)
      setError('')
      console.log('[v0] Attempting to connect wallet via SDK...')
      
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const context = sdk.context
      
      if (!context?.user?.username) {
        setError('Could not get username from wallet. Please enter manually or check if you are in Farcaster.')
        setIsLoading(false)
        return
      }

      console.log('[v0] Got username from SDK:', context.user.username)
      onLoadProfile(context.user.username)
    } catch (err) {
      console.error('[v0] Error connecting wallet:', err)
      setError('Failed to connect wallet. Please enter username manually.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto p-8 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="space-y-6">
        <div>
          <Button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-3">or</p>
        </div>

        {/* Manual username input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Farcaster Username</label>
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError('')
              }}
              placeholder="Enter username (e.g. vitalik)"
              className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'View Profile Stats'}
          </Button>
        </form>
      </div>
    </Card>
  )
}
