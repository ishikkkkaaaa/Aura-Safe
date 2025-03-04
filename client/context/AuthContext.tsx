'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  walletAddress: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const address = accounts[0].address
          setWalletAddress(address)
          // Set wallet address in headers and localStorage
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('wallet_address', address)
          }
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another Web3 wallet')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const address = accounts[0]
      setWalletAddress(address)

      // Set wallet address in headers for all future requests
      if (typeof window !== 'undefined') {
        const headers = new Headers()
        headers.set('x-wallet-address', address)
        window.localStorage.setItem('wallet_address', address)
      }

      // Check if user exists in Supabase
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single()

      if (!user) {
        // Redirect to registration if user doesn't exist
        window.location.href = '/register'
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  const disconnectWallet = async () => {
    try {
      setWalletAddress(null)
      // Clear any stored session data
      await supabase.auth.signOut()
      // Clear wallet address from headers and localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('wallet_address')
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        connectWallet,
        disconnectWallet,
        isAuthenticated: !!walletAddress,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 