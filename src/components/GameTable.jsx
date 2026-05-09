import { useState } from 'react'
import { supabase } from '../supabaseClient'

function GameTable({ room, player, players, onActionDone }) {
  const [raiseAmount, setRaiseAmount] = useState(String(room.big_blind))
  const myPlayer = players.find(p => p.profile_id === player.id)
  const isMyTurn = room.current_player_id === myPlayer?.id
  const currentBet = room.current_bet || 0
  const myBet = myPlayer?.current_bet || 0
  const callAmount = Math.max(0, currentBet - myBet)

  const total = players.length
  const dealerIndex = players.findIndex(p => p.id === room.dealer_id)
  const sbIndex = (dealerIndex + 1) % total
  const bbIndex = (dealerIndex + 2) % total

  async function handleFold() {
    await supabase.from('room_players').update({ folded: true }).eq('id', myPlayer.id)
    await advanceTurn()
  }

  async function handleCall() {
    const actual = Math.min(callAmount, myPlayer.stack)
    await supabase.from('room_players').update({
      stack: myPlayer.stack - actual,
      current_bet: myBet + actual
    }).eq('id', myPlayer.id)
    await supabase.from('rooms').update({ pot: room.pot + actual }).eq('id', room.id)
    await advanceTurn()
  }

  async function handleCheck() {
    await advanceTurn()
  }

  async function handleRaise() {
    const amount = parseInt(raiseAmount)
    if (!amount || amount <= 0) return alert('Cantidad inválida')
    const total = currentBet + amount
    const diff = Math.min(total - myBet, myPlayer.stack)
    await supabase.from('room_players').update({
      stack: myPlayer.stack - diff,
      current_bet: myBet + diff
    }).eq('id', myPlayer.id)
    await supabase.from('rooms').update({
      pot: room.pot + diff,
      current_bet: myBet + diff
    }).eq('id', room.id)
    await advanceTurn()
  }

  async function advanceTurn() {
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

  const positions = getPositions(players, myPlayer)

  return (
    <div style={styles.tableContainer}>
      {positions.map(({ p, pos }, i) => {
        const globalIndex = players.findIndex(pl => pl.id === p.id)
        const isDealer = p.id === room.dealer_id
        const isSB = globalIndex === sbIndex
        const isBB = globalIndex === bbIndex
        const isActive = p.id === room.current_player_id

        return (
          <PlayerAvatar
            key={p.id}
            player={p}
            position={pos}
            isDealer={isDealer}
            isSB={isSB}
            isBB={isBB}
            isActive={isActive}
          />
        )
      })}

      <div style={styles.potContainer}>
        <p style={styles.potLabel}>Bote</p>
        <p style={styles.potAmount}>{room.pot?.toLocaleString()}</p>
        {currentBet > 0 && (
          <p style={styles.currentBet}>Apuesta: {currentBet}</p>
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
          {currentBet === 0 ? 'PASAR' : `IGUALAR\n+${callAmount}`}
        </button>

        <div style={styles.raiseContainer}>
          <button
            style={isMyTurn ? styles.raiseControlBtn : styles.btnDisabled}
            disabled={!isMyTurn}
            onClick={() => setRaiseAmount(String(Math.max(room.big_blind, (parseInt(raiseAmount) || 0) - room.big_blind)))}
          >
            -
          </button>
          <div style={styles.raiseMid}>
            <button
              style={isMyTurn ? styles.raiseBtn : styles.btnDisabled}
              disabled={!isMyTurn}
              onClick={handleRaise}
            >
              SUBIR
            </button>
            <input
              style={styles.raiseInput}
              type="number"
              value={raiseAmount}
              onChange={e => setRaiseAmount(e.target.value)}
              disabled={!isMyTurn}
            />
          </div>
          <button
            style={isMyTurn ? styles.raiseControlBtn : styles.btnDisabled}
            disabled={!isMyTurn}
            onClick={() => setRaiseAmount(String((parseInt(raiseAmount) || 0) + room.big_blind))}
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
  const positionMap = {
    1: ['bottom'],
    2: ['bottom', 'top'],
    3: ['bottom', 'topLeft', 'topRight'],
    4: ['bottom', 'left', 'top', 'right'],
    5: ['bottom', 'left', 'topLeft', 'topRight', 'right'],
    6: ['bottom', 'bottomLeft', 'topLeft', 'top', 'topRight', 'bottomRight'],
  }
  const posNames = positionMap[Math.min(total, 6)] || positionMap[6]
  return players.map((p, i) => ({
    p,
    pos: posNames[(i - myIndex + total) % total] || 'top'
  }))
}

function PlayerAvatar({ player, position, isDealer, isSB, isBB, isActive }) {
  const posStyle = avatarPositions[position] || avatarPositions.top
  const size = isActive ? 70 : 50

  return (
    <div style={{ ...styles.avatarWrapper, ...posStyle }}>
      <div style={styles.badgeRow}>
        {isDealer && <span style={styles.badgeD}>D</span>}
        {isSB && <span style={styles.badgeSB}>SB</span>}
        {isBB && <span style={styles.badgeBB}>BB</span>}
      </div>
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
          opacity: player.folded ? 0.4 : 1,
        }}
      />
      <p style={styles.avatarName}>{player.profiles?.nickname}</p>
      <p style={styles.avatarStack}>{player.stack?.toLocaleString()}</p>
      {player.current_bet > 0 && (
        <p style={styles.avatarBet}>🪙 {player.current_bet?.toLocaleString()}</p>
      )}
      {player.folded && <p style={styles.foldedText}>RETIRADO</p>}
    </div>
  )
}

const avatarPositions = {
  bottom: { bottom: 150, left: '50%', transform: 'translateX(-50%)' },
  top: { top: 10, left: '50%', transform: 'translateX(-50%)' },
  left: { top: '38%', left: 10, transform: 'translateY(-50%)' },
  right: { top: '38%', right: 10, transform: 'translateY(-50%)' },
  topLeft: { top: 10, left: '18%' },
  topRight: { top: 10, right: '18%' },
  bottomLeft: { bottom: 150, left: '18%' },
  bottomRight: { bottom: 150, right: '18%' },
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
    minHeight: '320px',
  },
  potContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -60%)',
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
    background: 'rgba(0,0,0,0.6)',
    borderRadius: '0 0 22px 22px',
  },
  foldBtn: {
    flex: 1,
    background: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '10px 4px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  callBtn: {
    flex: 1,
    background: '#22c55e',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '10px 4px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'pre-line',
    textAlign: 'center',
  },
  raiseContainer: {
    flex: 1.5,
    display: 'flex',
    gap: '2px',
    alignItems: 'stretch',
  },
  raiseMid: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  raiseBtn: {
    background: '#4f46e5',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    padding: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1,
  },
  raiseInput: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    textAlign: 'center',
    padding: '4px',
    width: '100%',
  },
  raiseControlBtn: {
    flex: 1,
    background: '#3730a3',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnDisabled: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.2)',
    padding: '10px 4px',
    fontSize: '11px',
    cursor: 'not-allowed',
  },
  avatarWrapper: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1px',
  },
  badgeRow: {
    display: 'flex',
    gap: '2px',
    marginBottom: '2px',
  },
  badgeD: {
    background: '#fbbf24',
    color: '#000',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  badgeSB: {
    background: '#3b82f6',
    color: '#fff',
    borderRadius: '6px',
    padding: '1px 4px',
    fontSize: '9px',
    fontWeight: 'bold',
  },
  badgeBB: {
    background: '#ef4444',
    color: '#fff',
    borderRadius: '6px',
    padding: '1px 4px',
    fontSize: '9px',
    fontWeight: 'bold',
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
  avatarBet: {
    fontSize: '10px',
    color: '#86efac',
    textAlign: 'center',
  },
  foldedText: {
    fontSize: '9px',
    color: '#ef4444',
    fontWeight: 'bold',
  }
}

export default GameTable
