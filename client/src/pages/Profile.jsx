import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="page narrow">
      <h1>Profile</h1>
      <div className="card pad-lg">
        <p>
          <strong>{user?.name}</strong>
        </p>
        <p className="muted">{user?.email}</p>
        <p className="muted">Role: {user?.role}</p>
      </div>
    </div>
  )
}
