import { supabase } from './supabase'

interface Trip {
  destination: string
  startDate: string
  endDate: string
  creator_wallet: string
}

interface Requester {
  name: string
  wallet_address: string
}

export interface TripConnection {
  id: string
  trip_id: string
  requester_wallet: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  trip: Trip
  requester: Requester
}

export async function sendConnectionRequest(tripId: string, requesterWallet: string) {
  try {
    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('trip_connections')
      .select('*')
      .eq('trip_id', tripId)
      .eq('requester_wallet', requesterWallet)
      .single()

    if (existingConnection) {
      throw new Error('Connection request already exists')
    }

    // Create new connection request
    const { data, error } = await supabase
      .from('trip_connections')
      .insert([
        {
          trip_id: tripId,
          requester_wallet: requesterWallet,
          status: 'pending'
        }
      ])
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error sending connection request:', error)
    throw error
  }
}

export async function getConnectionRequests(walletAddress: string) {
  try {
    // Get trips where user is the creator
    const { data: userTrips } = await supabase
      .from('trips')
      .select('id')
      .eq('creator_wallet', walletAddress)

    if (!userTrips) return []

    const tripIds = userTrips.map(trip => trip.id)

    // Get connection requests for these trips
    const { data: connections, error } = await supabase
      .from('trip_connections')
      .select(`
        *,
        trip:trips (
          destination,
          startDate,
          endDate,
          creator_wallet
        ),
        requester:requester_wallet (
          name,
          wallet_address
        )
      `)
      .in('trip_id', tripIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return connections || []
  } catch (error) {
    console.error('Error fetching connection requests:', error)
    throw error
  }
}

export async function updateConnectionStatus(
  connectionId: string,
  status: 'accepted' | 'rejected'
) {
  try {
    const { data, error } = await supabase
      .from('trip_connections')
      .update({ status })
      .eq('id', connectionId)
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating connection status:', error)
    throw error
  }
}

export async function getConnectedTrips(walletAddress: string) {
  try {
    // Get accepted connections where user is the requester
    const { data: requesterConnections } = await supabase
      .from('trip_connections')
      .select(`
        *,
        trip:trips (
          *,
          creator:creator_wallet (
            name,
            wallet_address
          )
        )
      `)
      .eq('requester_wallet', walletAddress)
      .eq('status', 'accepted')

    // Get accepted connections where user is the trip creator
    const { data: creatorConnections } = await supabase
      .from('trip_connections')
      .select(`
        *,
        trip:trips (
          *,
          creator:creator_wallet (
            name,
            wallet_address
          )
        )
      `)
      .eq('trip.creator_wallet', walletAddress)
      .eq('status', 'accepted')

    return {
      requesterConnections: requesterConnections || [],
      creatorConnections: creatorConnections || []
    }
  } catch (error) {
    console.error('Error fetching connected trips:', error)
    throw error
  }
} 