const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function signupUser(name: string, email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, data }
    } else {
      const error = await response.json()
      return { success: false, error: error.error || 'Signup failed' }
    }
  } catch (error) {
    console.error('Signup error:', error)
    return { success: false, error: 'Network error' }
  }
}
