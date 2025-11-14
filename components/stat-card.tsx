'use client'

import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string
  subtitle?: string
  icon?: string
  gradient?: string
}

export default function StatCard({ 
  label, 
  value, 
  subtitle,
  icon = '📊',
  gradient = 'from-primary/20 to-primary/10'
}: StatCardProps) {
  return (
    <Card className={`p-6 border-border/50 bg-gradient-to-br ${gradient} backdrop-blur-sm hover:border-border/80 transition-colors`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-muted-foreground text-sm font-medium">{label}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      
      <p className="text-3xl font-bold break-words">{value}</p>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      )}
    </Card>
  )
}
