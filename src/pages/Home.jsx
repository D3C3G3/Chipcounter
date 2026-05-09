import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Login from '../components/Login'

function Home() {
  const [user, setUser] = useState(null)

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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>ChipCounter</h1>
      {user ? (
        <div>
          <p>Bienvenido, {user.user_metadata.full_name || user.email}</p>
          {user.user_metadata.avatar_url && (
            <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ borderRadius: '50%', width: '50px' }} />
          )}
          <br />
          <button onClick={handleLogout} style={{ marginTop: '20px' }}>Cerrar sesión</button>
        </div>
      ) : (
        <div>
          <p>Por favor, inicia sesión para continuar</p>
          <Login />
        </div>
      )}
    </div>
  )
}

export default Home
