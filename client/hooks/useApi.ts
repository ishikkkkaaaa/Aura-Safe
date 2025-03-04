import { useState } from 'react'

interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
  execute: (...args: any[]) => Promise<void>
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const execute = async (...args: any[]) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(...args)
      setData(result)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return { data, error, loading, execute }
} 