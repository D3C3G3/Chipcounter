import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function JoinRoom({ onBack }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleJoin() {
    if (code.length !== 4) return setError('El código debe tener 4 dígitos')
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .eq('status', 'waiting')
      .single()

    setLoading(false)

    if (error || !data) {
      setError('Sala no encontrada o ya cerrada')
    } else {
      navigate(`/game/${data.id}`)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Unirse a Sala</h2>

      <input
        style={styles.input}
        type="number"
        placeholder="Código de 4 dígitos"
        maxLength={4}
        value={code}
        onChange={e => setCode(e.target.value.slice(0, 4))}
      />

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.footer}>
        <button style={styles.cancelBtn} onClick={onBack}>Cancelar</button>
        <button style={styles.joinBtn} onClick={handleJoin} disabled={loading}>
          {loading ? 'Buscando...' : 'Unirse'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '340px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    textAlign: 'center',
    fontSize: '22px',
  },
  input: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: '#fff',
    padding: '14px',
    fontSize: '24px',
    textAlign: 'center',
    letterSpacing: '8px',
    width: '100%',
  },
  error: {
    color: '#f87171',
    textAlign: 'center',
    fontSize: '14px',
  },
  footer: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  cancelBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    padding: '14px',
    cursor: 'pointer',
  },
  joinBtn: {
    flex: 2,
    background: '#4f46e5',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    padding: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  }
}

export default JoinRoom
