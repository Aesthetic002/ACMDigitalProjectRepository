import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Mail, Lock, Loader2, Eye, EyeOff, Github, Chrome } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setToken } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)

  const from = location.state?.from?.pathname || '/'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      const token = await user.getIdToken()

      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      })
      setToken(token)

      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login error:', error)
      let message = 'Login failed. Please try again.'

      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.'
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.'
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.'
      }

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (providerType) => {
    setOauthLoading(providerType)

    try {
      const provider = providerType === 'google'
        ? new GoogleAuthProvider()
        : new GithubAuthProvider()

      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user
      const token = await user.getIdToken()

      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      })
      setToken(token)

      toast.success('Welcome!')
      navigate(from, { replace: true })
    } catch (error) {
      console.error('OAuth login error:', error)
      let message = 'Authentication failed. Please try again.'

      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Login cancelled.'
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px]" />
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
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-zinc-400 mt-1">Sign in to your account to continue</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-zinc-900 rounded-xl font-medium hover:bg-zinc-100 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-white/5"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Chrome className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              disabled={oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-800/80 text-white border border-zinc-600/50 rounded-xl font-medium hover:bg-zinc-700/80 transition-all disabled:opacity-50"
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Github className="w-5 h-5" />
                  <span>Continue with GitHub</span>
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
              <span className="px-4 bg-transparent text-zinc-500 backdrop-blur-sm">or sign in with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-zinc-400">Remember me</span>
              </label>
              <a href="#" className="text-primary-400 hover:text-primary-300">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-zinc-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
