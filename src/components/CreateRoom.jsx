import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const PRESETS = [
  { nombre: 'Rápida', stack: 1000, sb: 10, bb: 20 },
  { nombre: 'Estándar', stack: 5000, sb: 25, bb: 50 },
  { nombre: 'Profunda', stack: 10000, sb: 50, bb: 100 },
]

function CreateRoom({ onBack }) {
  const [preset, setPreset] = useState(PRESETS[1])
  const [rebuys, setRebuys] = useState(false)
  const [addons, setAddons] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  async function handleCreate() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const code = generateCode()

    const { data, error } = await supabase
      .from('rooms')
      .insert([{
        code,
        host_id: userId,
        stack_inicial: preset.stack,
        small_blind: preset.sb,
        big_blind: preset.bb,
        rebuys,
        addons,
        status: 'waiting'
      }])
      .select()
      .single()

    setLoading(false)
    if (!error) navigate(`/game/${data.id}`)
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Crear Sala</h2>

      <p style={styles.label}>Tipo de partida</p>
      <div style={styles.presets}>
        {PRESETS.map(p => (
          <button
            key={p.nombre}
            style={preset.nombre === p.nombre ? styles.presetActive : styles.preset}
            onClick={() => setPreset(p)}
          >
            <span style={styles.presetName}>{p.nombre}</span>
            <span style={styles.presetInfo}>Stack: {p.stack.toLocaleString()}</span>
            <span style={styles.presetInfo}>Blinds: {p.sb}/{p.bb}</span>
          </button>
        ))}
      </div>

      <div style={styles.toggleRow}>
        <span>Re-buys</span>
        <button
          style={rebuys ? styles.toggleOn : styles.toggleOff}
          onClick={() => setRebuys(!rebuys)}
        >
          {rebuys ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={styles.toggleRow}>
        <span>Add-ons</span>
        <button
          style={addons ? styles.toggleOn : styles.toggleOff}
          onClick={() => setAddons(!addons)}
        >
          {addons ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={styles.footer}>
        <button style={styles.cancelBtn} onClick={onBack}>Cancelar</button>
        <button style={styles.createBtn} onClick={handleCreate} disabled={loading}>
          {loading ? 'Creando...' : 'Crear Sala'}
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
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
  },
  presets: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  preset: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#fff',
    padding: '10px 6px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'center',
  },
  presetActive: {
    background: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '10px',
    color: '#fff',
    padding: '10px 6px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'center',
  },
  presetName: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  presetInfo: {
    fontSize: '11px',
    opacity: 0.8,
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  toggleOn: {
    background: '#4f46e5',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    padding: '6px 16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  toggleOff: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    padding: '6px 16px',
    cursor: 'pointer',
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
  createBtn: {
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

export default CreateRoom
