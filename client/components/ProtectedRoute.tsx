'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAadharVerification?: boolean
}

export default function ProtectedRoute({
  children,
  requireAadharVerification = false
}: ProtectedRouteProps) {
  const router = useRouter()
  const { walletAddress, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !walletAddress) {
      router.push('/signIn')
    }
  }, [walletAddress, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a0a1c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!walletAddress) {
    return null
  }

  return <>{children}</>
} 