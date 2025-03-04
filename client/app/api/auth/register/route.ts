import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { handleApiError, validateWalletAddress, validateEmail, validatePassword, validateAadharNumber } from '@/lib/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet_address, name, email, password, aadhar_number } = body

    // Validate inputs
    if (!validateWalletAddress(wallet_address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (!validateAadharNumber(aadhar_number)) {
      return NextResponse.json(
        { error: 'Invalid Aadhar number' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('wallet_address, email, aadhar_number')
      .or(`wallet_address.eq.${wallet_address},email.eq.${email},aadhar_number.eq.${aadhar_number}`)
      .single()

    if (existingUser) {
      if (existingUser.wallet_address === wallet_address) {
        return NextResponse.json(
          { error: 'Wallet address already registered' },
          { status: 409 }
        )
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }
      if (existingUser.aadhar_number === aadhar_number) {
        return NextResponse.json(
          { error: 'Aadhar number already registered' },
          { status: 409 }
        )
      }
    }

    // Create new user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          wallet_address,
          name,
          email,
          password, // Note: In production, hash the password before storing
          aadhar_number,
          is_aadhar_verified: false
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        wallet_address: user.wallet_address,
        name: user.name,
        email: user.email,
        is_aadhar_verified: user.is_aadhar_verified
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: handleApiError(error).message },
      { status: handleApiError(error).statusCode }
    )
  }
} 