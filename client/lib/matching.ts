import { supabase } from './supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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
  creator_wallet: string
  status: string
}

interface UserProfile {
  wallet_address: string
  name: string
  travel_preferences: {
    style: string
    interests: string[]
    budget_range: {
      min: number
      max: number
    }
  }
}

export async function findMatches(tripId: string) {
  try {
    // Fetch the trip details
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single()

    if (tripError) throw tripError

    // Fetch all active trips except the current one
    const { data: potentialTrips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .eq('status', 'active')
      .neq('id', tripId)
      .neq('creator_wallet', trip.creator_wallet)

    if (tripsError) throw tripsError

    // Fetch user profiles for all potential trips
    const creatorWallets = potentialTrips.map(t => t.creator_wallet)
    const { data: userProfiles, error: profilesError } = await supabase
      .from('users')
      .select('*')
      .in('wallet_address', creatorWallets)

    if (profilesError) throw profilesError

    // Prepare data for OpenAI analysis
    const tripData = {
      mainTrip: trip,
      potentialMatches: potentialTrips.map((t, index) => ({
        trip: t,
        profile: userProfiles[index]
      }))
    }

    // Use OpenAI to analyze compatibility
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a travel companion matching system. Analyze the compatibility between trips and users based on destination, dates, budget, travel style, and interests. Return a JSON array of matches with compatibility scores and reasons."
        },
        {
          role: "user",
          content: JSON.stringify(tripData)
        }
      ],
      response_format: { type: "json_object" }
    })

    const analysis = JSON.parse(completion.choices[0].message.content)
    
    // Sort matches by compatibility score
    const sortedMatches = analysis.matches.sort((a: any, b: any) => b.score - a.score)

    // Update trip matches in database
    const { error: updateError } = await supabase
      .from('trip_matches')
      .upsert(
        sortedMatches.map((match: any) => ({
          trip_id: tripId,
          matched_trip_id: match.tripId,
          compatibility_score: match.score,
          match_reason: match.reason
        }))
      )

    if (updateError) throw updateError

    return sortedMatches
  } catch (error) {
    console.error('Error in findMatches:', error)
    throw error
  }
}

export async function getTripMatches(tripId: string) {
  try {
    const { data: matches, error } = await supabase
      .from('trip_matches')
      .select(`
        *,
        matched_trip:trip_id (
          *,
          creator:creator_wallet (
            name,
            wallet_address
          )
        )
      `)
      .eq('trip_id', tripId)
      .order('compatibility_score', { ascending: false })

    if (error) throw error
    return matches
  } catch (error) {
    console.error('Error fetching trip matches:', error)
    throw error
  }
} 