'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

interface Trip {
  id: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  travelStyle: string
  interests: string[]
  description: string
  maxCompanions: number
  status: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const { walletAddress } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!walletAddress) {
      router.push('/signIn')
      return
    }

    fetchTrips()
  }, [walletAddress, router])

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('creator_wallet', walletAddress)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrips(data || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (tripId: string) => {
    try {
      // Create a connection request
      const { error } = await supabase
        .from('trip_connections')
        .insert([
          {
            trip_id: tripId,
            requester_wallet: walletAddress,
            status: 'pending'
          }
        ])

      if (error) throw error

      // Show success message or update UI
      alert('Connection request sent!')
    } catch (error) {
      console.error('Error sending connection request:', error)
      alert('Failed to send connection request')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0a1c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a0a1c]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">My Trips</h1>
          <button
            onClick={() => router.push('/trips/create')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors"
          >
            Create New Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-gray-300 mb-4">You haven't created any trips yet.</p>
            <button
              onClick={() => router.push('/trips/create')}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors"
            >
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {trip.destination}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    trip.status === 'active' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {trip.status}
                  </span>
                </div>

                <div className="space-y-3 text-gray-300">
                  <p>
                    <span className="font-medium">Dates:</span>{' '}
                    {new Date(trip.startDate).toLocaleDateString()} -{' '}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Budget:</span> ${trip.budget}
                  </p>
                  <p>
                    <span className="font-medium">Style:</span>{' '}
                    {trip.travelStyle}
                  </p>
                  <p>
                    <span className="font-medium">Max Companions:</span>{' '}
                    {trip.maxCompanions}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {trip.interests.map((interest) => (
                      <span
                        key={interest}
                        className="bg-white/5 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => router.push(`/trips/${trip.id}/matches`)}
                    className="flex-1 py-2 px-4 bg-white/5 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                  >
                    View Matches
                  </button>
                  <button
                    onClick={() => handleConnect(trip.id)}
                    className="flex-1 py-2 px-4 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
} 