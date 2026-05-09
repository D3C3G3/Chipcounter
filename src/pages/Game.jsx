import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import WaitingRoom from '../components/WaitingRoom'
import SelectProfile from '../components/SelectProfile'
import GameTable from '../components/GameTable'
import WinnerModal from '../components/WinnerModal'

function Game() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showWinner, setShowWinner] = useState(false)

  useEffect(() => {
    fetchRoom()
    fetchPlayers()
    const saved = localStorage.getItem(`player_${roomId}`)
    if (saved) setPlayer(JSON.parse(saved))
  }, [roomId])

  useEffect(() => {
    if (!room) return
    const interval = setInterval(() => {
      fetchRoom()
      fetchPlayers()
    }, 3000)
    return () => clearInterval(interval)
  }, [room])

  async function fetchRoom() {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
    if (data) setRoom(data)
  }

  async function fetchPlayers() {
    const { data } = await supabase
      .from('room_players')
      .select(`*, profiles(nickname, avatar_url)`)
      .eq('room_id', roomId)
      .order('turn_order', { ascending: true })
    if (data) setPlayers(data)
  }

  function handleProfileSelected(profile) {
    localStorage.setItem(`player_${roomId}`, JSON.stringify(profile))
    setPlayer(profile)
  }

async function handleStart() {
  if (players.length < 2) return

  const shuffled = [...players].sort(() => Math.random() - 0.5)
  for (let i = 0; i < shuffled.length; i++) {
    await supabase.from('room_players')
      .update({ turn_order: i, stack: room.stack_inicial, folded: false, current_bet: 0 })
      .eq('id', shuffled[i].id)
  }

  const dealer = shuffled[0]
  await startRound(shuffled, dealer.id, room)
}

async function startRound(orderedPlayers, dealerId, currentRoom) {
  const total = orderedPlayers.length
  const dealerIndex = orderedPlayers.findIndex(p => p.id === dealerId)

  const sbIndex = (dealerIndex + 1) % total
  const bbIndex = (dealerIndex + 2) % total
  const firstIndex = (dealerIndex + 3) % total

  const sb = orderedPlayers[sbIndex]
  const bb = orderedPlayers[bbIndex]
  const first = orderedPlayers[firstIndex]

  const sbAmount = Math.min(currentRoom.small_blind, sb.stack)
  const bbAmount = Math.min(currentRoom.big_blind, bb.stack)

  await supabase.from('room_players').update({
    stack: sb.stack - sbAmount,
    current_bet: sbAmount,
    folded: false,
  }).eq('id', sb.id)

  await supabase.from('room_players').update({
    stack: bb.stack - bbAmount,
    current_bet: bbAmount,
    folded: false,
  }).eq('id', bb.id)

  await supabase.from('rooms').update({
    status: 'playing',
    dealer_id: dealerId,
    current_player_id: first.id,
    pot: sbAmount + bbAmount,
    current_bet: bbAmount,
    round: (currentRoom.round || 0) + 1,
  }).eq('id', roomId)

  await fetchRoom()
  await fetchPlayers()
}

async function handleWinner(winnerIds) {
  const share = Math.floor(room.pot / winnerIds.length)
  for (const id of winnerIds) {
    const winner = players.find(p => p.id === id)
    await supabase.from('room_players').update({
      stack: winner.stack + share
    }).eq('id', id)
  }

  const allPlayers = [...players].sort((a, b) => a.turn_order - b.turn_order)
  const dealerIndex = allPlayers.findIndex(p => p.id === room.dealer_id)
  const nextDealerIndex = (dealerIndex + 1) % allPlayers.length
  const nextDealer = allPlayers[nextDealerIndex]

  await supabase.from('room_players').update({
    current_bet: 0
  }).in('id', players.map(p => p.id))

  await startRound(allPlayers, nextDealer.id, {
    ...room,
    pot: 0,
    current_bet: 0,
  })

  setShowWinner(false)
}


  async function handleWinner(winnerIds) {
    const share = Math.floor(room.pot / winnerIds.length)
    for (const id of winnerIds) {
      const winner = players.find(p => p.id === id)
      await supabase.from('room_players').update({
        stack: winner.stack + share
      }).eq('id', id)
    }

    const active = players.filter(p => !p.folded)
    const nextDealerIndex = (active.findIndex(p => p.id === room.dealer_id) + 1) % active.length
    const nextDealer = active[nextDealerIndex]
    const nextPlayer = active[(nextDealerIndex + 1) % active.length]

    await supabase.from('rooms').update({
      pot: 0,
      current_bet: 0,
      dealer_id: nextDealer.id,
      current_player_id: nextPlayer.id,
      round: room.round + 1,
    }).eq('id', roomId)

    await supabase.from('room_players').update({
      folded: false,
      current_bet: 0
    }).in('id', players.map(p => p.id))

    setShowWinner(false)
    await fetchRoom()
    await fetchPlayers()
  }

  const myPlayer = players.find(p => p.profile_id === player?.id)
  const isHost = room?.host_id !== undefined && players.find(p => p.profile_id === player?.id)

  if (loading && !room) return <div style={styles.loading}>Cargando...</div>

  if (!player) return (
    <SelectProfile roomId={roomId} onSelect={handleProfileSelected} />
  )

  if (room?.status === 'waiting') return (
    <WaitingRoom
      room={room}
      player={player}
      players={players}
      onStart={handleStart}
    />
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {players.map(p => (
          <div key={p.id} style={styles.headerPlayer}>
            <span style={styles.headerName}>{p.profiles?.nickname}</span>
            <span style={styles.headerStack}>{p.stack?.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <GameTable
        room={room}
        player={player}
        players={players}
        onActionDone={() => { fetchRoom(); fetchPlayers() }}
      />

      {room?.host_id && (
        <button style={styles.winnerBtn} onClick={() => setShowWinner(true)}>
          🏆 Declarar ganador
        </button>
      )}

      {showWinner && (
        <WinnerModal
          players={players}
          pot={room.pot}
          onConfirm={handleWinner}
        />
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '12px',
    gap: '8px',
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: '40vh',
  },
  header: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '10px',
    border: '1px solid rgba(79,70,229,0.4)',
  },
  headerPlayer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '70px',
    gap: '2px',
  },
  headerName: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 'bold',
  },
  headerStack: {
    fontSize: '11px',
    color: '#fbbf24',
  },
  winnerBtn: {
    background: '#fbbf24',
    border: 'none',
    borderRadius: '12px',
    color: '#000',
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  }
}

export default Game
