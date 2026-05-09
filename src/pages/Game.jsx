import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import WaitingRoom from '../components/WaitingRoom'
import SelectProfile from '../components/SelectProfile'

function Game() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoom()
    const saved = localStorage.getItem(`player_${roomId}`)
    if (saved) setPlayer(JSON.parse(saved))
  }, [roomId])

  async function fetchRoom() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error || !data) navigate('/lobby')
    else setRoom(data)
    setLoading(false)
  }

  function handleProfileSelected(profile) {
    localStorage.setItem(`player_${roomId}`, JSON.stringify(profile))
    setPlayer(profile)
  }

  if (loading) return <div style={styles.loading}>Cargando...</div>

  if (!player) return (
    <SelectProfile
      roomId={roomId}
      onSelect={handleProfileSelected}
    />
  )

  return (
    <WaitingRoom
      room={room}
      player={player}
      onStart={() => alert('Partida iniciada!')}
    />
  )
}

const styles = {
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: '40vh',
  }
}

export default Game
