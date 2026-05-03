import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (ex) {
      setErr(ex.response?.data?.message || ex.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page narrow">
      <div className="card pad-lg auth-card">
        <h1>Log in</h1>
        <p className="muted">
          Demo user: <code>user@hyderabadbiriyani.test</code> / <code>user123</code>
        </p>
        <form className="stack-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {err ? <p className="error-text">{err}</p> : null}
          <button type="submit" className="btn btn-primary stretch" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="muted">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
