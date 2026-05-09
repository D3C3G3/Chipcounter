import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function WaitingRoom({ room, player, onStart }) {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    fetchPlayers()
    const interval = setInterval(fetchPlayers, 3000)
    return () => clearInterval(interval)
  }, [])

  async function fetchPlayers() {
    const { data, error } = await supabase
      .from('room_players')
      .select(`
        id,
        stack,
        profile_id,
        profiles (
          nickname,
          avatar_url
        )
      `)
      .eq('room_id', room.id)

    if (error) console.error('Error:', error.message)
    if (data) setPlayers(data)
  }

  const isHost = room.host_id === player?.user_id

  return (
    <div style={styles.container}>
      <div style={styles.codeBox}>
        <p style={styles.codeLabel}>Código de sala</p>
        <p style={styles.code}>{room.code}</p>
        <p style={styles.codeHint}>Comparte este código con los jugadores</p>
      </div>

      <div style={styles.playersList}>
        <p style={styles.playersTitle}>Jugadores ({players.length})</p>
        {players.length === 0 && (
          <p style={styles.empty}>Esperando jugadores...</p>
        )}
        {players.map(p => (
          <div key={p.id} style={styles.playerRow}>
            {p.profiles?.avatar_url ? (
              <img
                src={p.profiles.avatar_url}
                alt={p.profiles.nickname}
                style={styles.avatar}
              />
            ) : (
              <div style={styles.avatarFallback}>
                {p.profiles?.nickname?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <span style={styles.playerName}>{p.profiles?.nickname || 'Jugador'}</span>
          </div>
        ))}
      </div>

      {isHost && (
        <button
          style={players.length < 2 ? styles.startBtnDisabled : styles.startBtn}
          onClick={onStart}
          disabled={players.length < 2}
        >
          {players.length < 2 ? 'Esperando jugadores...' : 'Iniciar Partida'}
        </button>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '32px 24px',
    gap: '24px',
  },
  codeBox: {
    background​​​​​​​​​​​​​​​​
