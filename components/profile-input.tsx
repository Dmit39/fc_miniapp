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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) {
      setError('Please enter a username')
      return
    }
    setError('')
    onLoadProfile(input.trim())
  }

  return (
    <Card className="max-w-md mx-auto p-8 border-border/50 bg-card/50 backdrop-blur-sm">
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
          />
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </div>
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          View Profile Stats
        </Button>
      </form>
    </Card>
  )
}
