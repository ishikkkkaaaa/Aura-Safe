'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import CreateTripForm from '@/components/trips/CreateTripForm'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function CreateTrip() {
  const router = useRouter()
  const { walletAddress } = useAuth()

  useEffect(() => {
    if (!walletAddress) {
      router.push('/signIn')
    }
  }, [walletAddress, router])

  if (!walletAddress) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#1a0a1c]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Create a New Trip</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Tell us about your travel plans and preferences. We'll help you find the perfect travel companions!
          </p>
        </div>

        <CreateTripForm />
      </main>

      <Footer />
    </div>
  )
} 