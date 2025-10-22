import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import SignUpForm from './SignUpForm.jsx'
import SignInForm from './SignInForm.jsx'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { signUp, signIn } = useAuth()

  const handleSignUp = async (email, password, username) => {
    setLoading(true)
    setMessage('')
    
    const { data, error } = await signUp(email, password, username)
    
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for confirmation link!')
    }
    
    setLoading(false)
  }

  const handleSignIn = async (email, password) => {
    setLoading(true)
    setMessage('')
    
    const { data, error } = await signIn(email, password)
    
    if (error) {
      setMessage(error.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen">
          {/* Left side - Branding */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
            <div className="max-w-md text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">CashDash</h1>
              <p className="text-xl text-gray-600 mb-8">
                Your gamified personal finance tracker
              </p>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-center justify-center space-x-3">
                  <span>Track expenses with ease</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <span>Set and achieve financial goals</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <span>Earn XP and level up your finances</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center py-12">
            <div className="max-w-md w-full space-y-8">
              <div className="text-center lg:hidden">
                <h1 className="text-3xl font-bold text-gray-900">CashDash</h1>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {isSignUp ? 'Create your account' : 'Welcome back!'}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {isSignUp 
                      ? 'Join thousands of users improving their financial habits' 
                      : 'Sign in to continue your financial journey'
                    }
                  </p>
                </div>

                {message && (
                  <div className={`mb-6 p-4 rounded-lg text-sm ${
                    message.includes('Check your email') 
                      ? 'bg-green-50 border border-green-200 text-green-700' 
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {message}
                  </div>
                )}

                {isSignUp ? (
                  <SignUpForm onSubmit={handleSignUp} loading={loading} />
                ) : (
                  <SignInForm onSubmit={handleSignIn} loading={loading} />
                )}

                <div className="mt-8 text-center">
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setMessage('')
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}