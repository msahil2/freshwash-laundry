import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      // Try to call backend API
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email }
      )
      setSubmitted(true)
      toast.success('Password reset email sent!')
    } catch (error) {
      // In demo mode - show success anyway
      console.log('Demo mode - simulating password reset email')
      setSubmitted(true)
      toast.success('Password reset email sent! (Demo Mode)')
    } finally {
      setLoading(false)
    }
  }
  // Success State
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="font-semibold text-primary-600 mb-6">
              {email}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">
                🎭 Demo Mode
              </p>
              <p className="text-xs text-blue-700">
                No real email is sent in demo mode. To reset your password,
                please contact the admin or use the demo credentials:
              </p>
              <p className="text-xs text-blue-700 mt-2">
                <strong>User:</strong> test@example.com / password123
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full btn-primary text-center block"
              >
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setEmail('')
                }}
                className="w-full btn-outline text-center block"
              >
                Try Different Email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Form State
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-gray-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="loader"></div>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="flex items-center justify-center space-x-2 text-sm text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>

          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                🎭 Demo Mode
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Admin:</strong> admin@freshwash.com / password123</p>
                <p><strong>User:</strong> test@example.com / password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ForgotPassword