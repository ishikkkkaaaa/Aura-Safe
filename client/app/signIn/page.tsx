'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { walletAddress, connectWallet } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (walletAddress) {
      // Check if user exists with this wallet address
      const checkUser = async () => {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single()

        if (user) {
          if (!user.is_aadhar_verified) {
            router.push('/aadhar-verification')
          } else {
            router.push('/dashboard')
          }
        } else {
          router.push('/register')
        }
      }
      checkUser()
    }
  }, [walletAddress, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // First connect wallet if not already connected
      if (!walletAddress) {
        try {
          await connectWallet()
          return // The useEffect will handle the redirection
        } catch (err: any) {
          setError('Failed to connect wallet: ' + (err.message || 'Please install MetaMask'))
          return
        }
      }

      // Then check if user exists with this email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError || !user) {
        setError('No account found with this email')
        return
      }

      // Verify password (in a real app, you'd hash this)
      if (user.password !== password) {
        setError('Invalid password')
        return
      }

      // Check if Aadhar is verified
      if (!user.is_aadhar_verified) {
        router.push('/aadhar-verification')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError('Sign in failed: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="absolute inset-0 -z-10 bg-[#1a0a1c]" />
      
      <div className="container mx-auto px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-white/70">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-pink-500"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 h-12"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              {!walletAddress && (
                <Button 
                  type="button"
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 h-12"
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-white/70">
            Don't have an account?{" "}
            <Link href="/register" className="text-pink-500 hover:text-pink-400">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
} 