import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { handleApiError } from '@/lib/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet_address, verification_proof } = body

    if (!wallet_address || !verification_proof) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the Aadhar proof using the anon-aadhaar service
    // This is a placeholder - implement actual verification logic
    const isVerified = true // Replace with actual verification

    if (!isVerified) {
      return NextResponse.json(
        { error: 'Aadhar verification failed' },
        { status: 400 }
      )
    }

    // Update user's verification status
    const { data: user, error } = await supabase
      .from('users')
      .update({ is_aadhar_verified: true })
      .eq('wallet_address', wallet_address)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'Aadhar verified successfully',
      user: {
        wallet_address: user.wallet_address,
        is_aadhar_verified: user.is_aadhar_verified
      }
    })
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.statusCode }
    )
  }
} 