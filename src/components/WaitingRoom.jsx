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
    const { data } = await supabase
      .from('room_players')
      .select('*, profiles(nickname, avatar_url)')
      .eq('room_id', room.id)

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
            <img
              src={p.profiles?.avatar_url || '/default-avatar.png'}
              alt={p.profiles?.nickname}
              style={styles.avatar}
            />
            <span style={styles.playerName}>{p.profiles?.nickname}</span>
          </div>
        ))}
      </div>

      {isHost && (
        <button
          style={styles.startBtn}
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
    background: 'rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '340px',
  },
  codeLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    marginBottom: '8px',
  },
  code: {
    fontSize: '56px',
    fontWeight: 'bold',
    letterSpacing: '12px',
    color: '#4f46e5',
  },
  codeHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    marginTop: '8px',
  },
  playersList: {
    width: '100%',
    maxWidth: '340px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  playersTitle: {
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '4px',
  },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '16px 0',
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  playerName: {
    fontSize: '15px',
    fontWeight: 'bold',
  },
  startBtn: {
    width: '100%',
    maxWidth: '340px',
    background: '#4f46e5',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    padding: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 'auto',
  }
}

export default WaitingRoom
