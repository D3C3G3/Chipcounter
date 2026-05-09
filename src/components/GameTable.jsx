import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function GameTable({ room, player, players, onActionDone }) {
  const [raiseAmount, setRaiseAmount] = useState(room.big_blind)
  const myPlayer = players.find(p => p.profile_id === player.id)
  const isMyTurn = room.current_player_id === myPlayer?.id
  const currentBet = room.current_bet || 0

  async function handleFold() {
    await supabase.from('room_players').update({ folded: true }).eq('id', myPlayer.id)
    await advanceTurn()
  }

  async function handleCall() {
    const diff = currentBet - (myPlayer.current_bet || 0)
    const actualDiff = Math.min(diff, myPlayer.stack)
    await supabase.from('room_players').update({
      stack: myPlayer.stack - actualDiff,
      current_bet: myPlayer.current_bet + actualDiff
    }).eq('id', myPlayer.id)
    await supabase.from('rooms').update({ pot: room.pot + actualDiff }).eq('id', room.id)
    await advanceTurn()
  }

  async function handleCheck() {
    await advanceTurn()
  }

  async function handleRaise() {
    const total = currentBet + raiseAmount
    const diff = total - (myPlayer.current_bet || 0)
    const actualDiff = Math.min(diff, myPlayer.stack)
    await supabase.from('room_players').update({
      stack: myPlayer.stack - actualDiff,
      current_bet: total
    }).eq('id', myPlayer.id)
    await supabase.from('rooms').update({
      pot: room.pot + actualDiff,
      current_bet: total
    }).eq('id', room.id)
    await advanceTurn()
  }

  async function advanceTurn() {
    const active = players.filter(p => !p.folded && p.id !== myPlayer.id)
    if (active.length === 0) return
    const currentIndex = players.findIndex(p => p.id === room.current_player_id)
    let next = null
    for (let i = 1; i <= players.length; i++) {
      const candidate = players[(currentIndex + i) % players.length]
      if (!candidate.folded) { next = candidate; break }
    }
    if (next) {
      await supabase.from('rooms').update({ current_player_id: next.id }).eq('id', room.id)
    }
    onActionDone()
  }

  const activePlayers = players.filter(p => !p.folded)
  const positions = getPositions(players, myPlayer)

  return (
    <div style={styles.tableContainer}>
      {positions.map(({ p, pos }) => (
        <PlayerAvatar
          key={p.id}
          player={p}
          position={pos}
          isDealer={room.dealer_id === p.id}
          isActive={room.current_player_id === p.id}
          isMe={p.id === myPlayer?.id}
        />
      ))}

      <div style={styles.potContainer}>
        <p style={styles.potLabel}>Bote</p>
        <p style={styles.potAmount}>{room.pot?.toLocaleString()}</p>
        {currentBet > 0 && (
          <p style={styles.currentBet}>Apuesta actual: {currentBet}</p>
        )}
      </div>

      <div style={styles.actions}>
        <button
          style={isMyTurn ? styles.foldBtn : styles.btnDisabled}
          disabled={!isMyTurn}
          onClick={handleFold}
        >
          RETIRARSE
        </button>

        <button
          style={isMyTurn ? styles.callBtn : styles.btnDisabled}
          disabled={!isMyTurn}
          onClick={currentBet === 0 ? handleCheck : handleCall}
        >
          {currentBet === 0 ? 'PASAR' : 'IGUALAR'}
        </button>

        <div style={styles.raiseContainer}>
          <button
            style={isMyTurn ? styles.raiseControlBtn : styles.btnDisabled}
            disabled={!isMyTurn}
            onClick={() => setRaiseAmount(Math.max(room.big_blind, raiseAmount - room.big_blind))}
          >
            -
          </button>
          <button
            style={isMyTurn ? styles.raiseBtn : styles.btnDisabled}
            disabled={!isMyTurn}
            onClick={handleRaise}
          >
            SUBIR{'\n'}{raiseAmount}
          </button>
          <button
            style={isMyTurn ? styles.raiseControlBtn : styles.btnDisabled}
            disabled={!isMyTurn}
            onClick={() => setRaiseAmount(raiseAmount + room.big_blind)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

function getPositions(players, myPlayer) {
  const myIndex = players.findIndex(p => p.id === myPlayer?.id)
  const total = players.length
  const positions = []

  const positionMap = {
    1: ['bottom'],
    2: ['bottom', 'top'],
    3: ['bottom', 'topLeft', 'topRight'],
    4: ['bottom', 'left', 'top', 'right'],
    5: ['bottom', 'left', 'topLeft', 'topRight', 'right'],
    6: ['bottom', 'bottomLeft', 'topLeft', 'top', 'topRight', 'bottomRight'],
  }

  const posNames = positionMap[Math.min(total, 6)] || positionMap[6]

  for (let i = 0; i < total; i++) {
    const relIndex = (i - myIndex + total) % total
    positions.push({
      p: players[i],
      pos: posNames[relIndex] || 'top'
    })
  }

  return positions
}

function PlayerAvatar({ player, position, isDealer, isActive, isMe }) {
  const posStyle = avatarPositions[position] || avatarPositions.top
  const size = isActive ? 70 : 50

  return (
    <div style={{ ...styles.avatarWrapper, ...posStyle }}>
      {isDealer && <div style={styles.dealerBadge}>D</div>}
      <img
        src={player.profiles?.avatar_url || '/default-avatar.png'}
        alt={player.profiles?.nickname}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: isActive ? '3px solid #4f46e5' : '2px solid rgba(255,255,255,0.2)',
          transition: 'all 0.3s',
        }}
      />
      <p style={styles.avatarName}>{player.profiles?.nickname}</p>
      <p style={styles.avatarStack}>{player.stack?.toLocaleString()}</p>
      {player.folded && <div style={styles.foldedOverlay}>RETIRADO</div>}
    </div>
  )
}

const avatarPositions = {
  bottom: { bottom: 140, left: '50%', transform: 'translateX(-50%)' },
  top: { top: 10, left: '50%', transform: 'translateX(-50%)' },
  left: { top: '40%', left: 10, transform: 'translateY(-50%)' },
  right: { top: '40%', right: 10, transform: 'translateY(-50%)' },
  topLeft: { top: 10, left: '20%' },
  topRight: { top: 10, right: '20%' },
  bottomLeft: { bottom: 140, left: '20%' },
  bottomRight: { bottom: 140, right: '20%' },
}

const styles = {
  tableContainer: {
    position: 'relative',
    width: '100%',
    flex: 1,
    background: 'rgba(0,80,0,0.3)',
    borderRadius: '24px',
    border: '2px solid rgba(0,150,0,0.4)',
    margin: '8px 0',
    minHeight: '300px',
  },
  potContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  potLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
  },
  potAmount: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  currentBet: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    marginTop: '4px',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    gap: '4px',
    padding: '8px',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '0 0 22px 22px',
  },
  foldBtn: {
    flex: 1,
    background: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '12px 4px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  callBtn: {
    flex: 1,
    background: '#22c55e',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '12px 4px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  raiseContainer: {
    flex: 1.5,
    display: 'flex',
    gap: '2px',
  },
  raiseBtn: {
    flex: 2,
    background: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '12px 4px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'pre-line',
    textAlign: 'center',
  },
  raiseControlBtn: {
    flex: 1,
    background: '#3730a3',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnDisabled: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.2)',
    padding: '12px 4px',
    fontSize: '12px',
    cursor: 'not-allowed',
  },
  avatarWrapper: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  dealerBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    background: '#fbbf24',
    color: '#000',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    zIndex: 10,
  },
  avatarName: {
    fontSize: '10px',
    color: '#fff',
    textAlign: 'center',
    maxWidth: '70px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  avatarStack: {
    fontSize: '10px',
    color: '#fbbf24',
    textAlign: 'center',
  },
  foldedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    color: '#ef4444',
    fontWeight: 'bold',
  }
}

export default GameTable
