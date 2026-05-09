import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateRoom from '../components/CreateRoom'
import JoinRoom from '../components/JoinRoom'

function Lobby() {
  const [view, setView] = useState(null)
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate('/')}>← Volver</button>
      <h1 style={styles.title}>🃏 ChipCounter</h1>

      {!view && (
        <div style={styles.buttons}>
          <button style={styles.btn} onClick={() => setView('create')}>
            Crear Sala
          </button>
          <button style={styles.btnSecondary} onClick={() => setView('join')}>
            Unirse a Sala
          </button>
        </div>
      )}

      {view === 'create' && <CreateRoom onBack={() => setView(null)} />}
      {view === 'join' && <JoinRoom onBack={() => setView(null)} />}
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
    gap: '24px',
    padding: '24px',
  },
  back: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
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
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: '#fff',
    padding: '14px',
    fontSize: '16px',
    cursor: 'pointer',
  }
}

export default Lobby
