'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getConnectionRequests, updateConnectionStatus, TripConnection } from '@/lib/connections'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function Connections() {
  const router = useRouter()
  const { walletAddress } = useAuth()
  const [requests, setRequests] = useState<TripConnection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!walletAddress) {
      router.push('/signIn')
      return
    }

    fetchRequests()
  }, [walletAddress, router])

  const fetchRequests = async () => {
    try {
      const data = await getConnectionRequests(walletAddress)
      setRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateConnectionStatus(connectionId, status)
      // Refresh requests after update
      fetchRequests()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update request status')
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
          <h1 className="text-4xl font-bold text-white">Connection Requests</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white/5 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-gray-300">No pending connection requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {request.trip.destination}
                  </h2>
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                    Pending
                  </span>
                </div>

                <div className="space-y-3 text-gray-300">
                  <p>
                    <span className="font-medium">From:</span>{' '}
                    {request.requester.name}
                  </p>
                  <p>
                    <span className="font-medium">Dates:</span>{' '}
                    {new Date(request.trip.startDate).toLocaleDateString()} -{' '}
                    {new Date(request.trip.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Requested:</span>{' '}
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'accepted')}
                    className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                    className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Reject
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