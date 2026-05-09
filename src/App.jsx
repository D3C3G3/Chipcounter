import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Spectator from './pages/Spectator'
import Profiles from './pages/Profiles'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40vh' }}>Cargando...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profiles" element={session ? <Profiles /> : <Navigate to="/login" />} />
        <Route path="/lobby" element={session ? <Lobby /> : <Navigate to="/login" />} />
        <Route path="/game/:roomId" element={session ? <Game /> : <Navigate to="/login" />} />
        <Route path="/spectator/:roomId" element={session ? <Spectator /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
