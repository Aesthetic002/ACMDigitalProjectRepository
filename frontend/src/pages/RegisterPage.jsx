import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Loader2, Eye, EyeOff, Github, Chrome, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(formData.password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
  ]

  const isPasswordValid = passwordRequirements.every((req) => req.met)

  const handleEmailRegister = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    if (!isPasswordValid) {
      toast.error('Password does not meet requirements')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      await updateProfile(user, { displayName: formData.name })

      const token = await user.getIdToken()

      setToken(token)

      try {
        await authAPI.register({ displayName: formData.name })
      } catch (backendError) {
        console.warn('Backend registration failed:', backendError)
      }

      setUser({
        uid: user.uid,
        email: user.email,
        displayName: formData.name,
        photoURL: user.photoURL,
      })
      setToken(token)

      toast.success('Account created successfully!')
      navigate('/')
    } catch (error) {
      console.error('Registration error:', error)
      let message = 'Registration failed. Please try again.'

      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.'
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak.'
      }

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthRegister = async (providerType) => {
    setOauthLoading(providerType)

    try {
      const provider = providerType === 'google'
        ? new GoogleAuthProvider()
        : new GithubAuthProvider()

      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user
      const token = await user.getIdToken()

      setToken(token)

      try {
        await authAPI.register({ displayName: user.displayName })
      } catch (backendError) {
        console.warn('Backend registration failed:', backendError)
      }

      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      })
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      })

      toast.success('Account created successfully!')
      navigate('/')
    } catch (error) {
      console.error('OAuth registration error:', error)
      let message = 'Authentication failed. Please try again.'

      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Registration cancelled.'
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with this email using a different sign-in method.'
      }

      toast.error(message)
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-in relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card wrapper */}
        <div className="glass-premium rounded-2xl p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                <span className="text-2xl font-bold text-white">ACM</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white">Create an account</h1>
            <p className="text-zinc-400 mt-1">Join the ACM community today</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuthRegister('google')}
              disabled={oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-zinc-900 rounded-xl font-medium hover:bg-zinc-100 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-white/5"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Chrome className="w-5 h-5" />
                  <span>Sign up with Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleOAuthRegister('github')}
              disabled={oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-800/80 text-white border border-zinc-600/50 rounded-xl font-medium hover:bg-zinc-700/80 transition-all disabled:opacity-50"
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Github className="w-5 h-5" />
                  <span>Sign up with GitHub</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-zinc-500 backdrop-blur-sm">or sign up with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 input-glow"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 input-glow"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 input-glow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-1.5">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-xs ${req.met ? 'text-emerald-400' : 'text-zinc-500'}`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${req.met ? 'opacity-100' : 'opacity-40'}`} />
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3 input-glow ${formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? '!border-red-500/60'
                    : ''
                    }`}
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>
        </div>

        {/* Terms */}
        <p className="text-center text-zinc-500 text-xs mt-4">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary-400 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>
        </p>

        {/* Sign In Link */}
        <p className="text-center text-zinc-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
