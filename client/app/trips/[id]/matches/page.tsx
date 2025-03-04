'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { getTripMatches } from '@/lib/matching'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

interface Match {
  trip_id: string
  matched_trip_id: string
  compatibility_score: number
  match_reason: string
  matched_trip: {
    destination: string
    startDate: string
    endDate: string
    budget: number
    travelStyle: string
    interests: string[]
    description: string
    creator: {
      name: string
      wallet_address: string
    }
  }
}

export default function TripMatches() {
  const params = useParams()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getTripMatches(params.id as string)
        setMatches(data)
      } catch (error) {
        console.error('Error fetching matches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [params.id])

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-8">Your Trip Matches</h1>

          {matches.length === 0 ? (
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
              <p className="text-gray-300">No matches found yet. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, index) => (
                <motion.div
                  key={match.matched_trip_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">
                      {match.matched_trip.destination}
                    </h2>
                    <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm">
                      {Math.round(match.compatibility_score * 100)}% Match
                    </div>
                  </div>

                  <div className="space-y-3 text-gray-300">
                    <p>
                      <span className="font-medium">Traveler:</span>{' '}
                      {match.matched_trip.creator.name}
                    </p>
                    <p>
                      <span className="font-medium">Dates:</span>{' '}
                      {new Date(match.matched_trip.startDate).toLocaleDateString()} -{' '}
                      {new Date(match.matched_trip.endDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Budget:</span> ${match.matched_trip.budget}
                    </p>
                    <p>
                      <span className="font-medium">Style:</span>{' '}
                      {match.matched_trip.travelStyle}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {match.matched_trip.interests.map((interest) => (
                        <span
                          key={interest}
                          className="bg-white/5 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Why This Match?</h3>
                    <p className="text-gray-300 text-sm">{match.match_reason}</p>
                  </div>

                  <button
                    className="w-full mt-6 py-2 px-4 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
                    onClick={() => {
                      // Implement connection logic
                      console.log('Connect with traveler:', match.matched_trip.creator.name)
                    }}
                  >
                    Connect with Traveler
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
} 