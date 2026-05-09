function WinnerModal({ players, pot, onConfirm }) {
  const activePlayers = players.filter(p => !p.folded)
  const [selected, setSelected] = useState([])

  function togglePlayer(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleConfirm() {
    if (selected.length === 0) return alert('Selecciona al menos un ganador')
    onConfirm(selected)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>¿Quién gana el bote?</h2>
        <p style={styles.pot}>🏆 {pot?.toLocaleString()}</p>
        <p style={styles.hint}>Selecciona uno o varios ganadores</p>

        <div style={styles.list}>
          {activePlayers.map(p => (
            <button
              key={p.id}
              style={selected.includes(p.id) ? styles.playerSelected : styles.player}
              onClick={() => togglePlayer(p.id)}
            >
              <img
                src={p.profiles?.avatar_url || '/default-avatar.png'}
                alt={p.profiles?.nickname}
                style={styles.avatar}
              />
              <span>{p.profiles?.nickname}</span>
              <span style={styles.stack}>{p.stack?.toLocaleString()}</span>
            </button>
          ))}
        </div>

        <button style={styles.confirmBtn} onClick={handleConfirm}>
          Confirmar ganador
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modal: {
    background: '#1a1a2e',
    borderRadius: '20px',
    padding: '24px',
    width: '90%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    textAlign: 'center',
    fontSize: '20px',
  },
  pot: {
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  player: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.07)',
    border: '2px solid transparent',
    borderRadius: '12px',
    padding: '10px',
    color: '#fff',
    cursor: 'pointer',
  },
  playerSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(79,70,229,0.3)',
    border: '2px solid #4f46e5',
    borderRadius: '12px',
    padding: '10px',
    color: '#fff',
    cursor: 'pointer',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  stack: {
    marginLeft: 'auto',
    color: '#fbbf24',
    fontSize: '14px',
  },
  confirmBtn: {
    background: '#4f46e5',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
  }
}

export default WinnerModal
