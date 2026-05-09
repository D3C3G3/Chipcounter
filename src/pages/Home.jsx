import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Home() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🃏 ChipCounter</h1>
      {user && (
        <div style={styles.userInfo}>
          {user.user_metadata.avatar_url && (
            <img src={user.user_metadata.avatar_url} alt="Avatar" style={styles.avatar} />
          )}
          <p style={styles.welcome}>Hola, {user.user_metadata.full_name || user.email}</p>
        </div>
      )}
      <div style={styles.buttons}>
        <button style={styles.btn} onClick={() => navigate('/profiles')}>
          Mis Perfiles
        </button>
        <button style={styles.btn} onClick={() => navigate('/lobby')}>
          Jugar
        </button>
        <button style={styles.logout} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '20px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    borderRadius: '50%',
    width: '60px',
    height: '60px',
  },
  welcome: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '280px',
  },
  btn: {
    background: '#4f46e5',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  logout: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    padding: '14px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '8px',
  }
}

export default Home
