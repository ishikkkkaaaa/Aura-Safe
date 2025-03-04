export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: any): never {
  if (error instanceof ApiError) {
    throw error
  }

  if (error.code === '23505') { // Unique violation
    throw new ApiError(409, 'Resource already exists')
  }

  if (error.code === '23503') { // Foreign key violation
    throw new ApiError(400, 'Invalid reference to related resource')
  }

  console.error('Unexpected error:', error)
  throw new ApiError(500, 'Internal server error')
}

export function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function validateAadharNumber(aadhar: string): boolean {
  return /^\d{12}$/.test(aadhar)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8
} 