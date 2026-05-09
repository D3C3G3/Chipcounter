import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

function SelectProfile({ roomId, onSelect }) {
  const [profiles, setProfiles] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [nickname, setNickname] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef()
  const cameraInputRef = useRef()

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    const { data: { session } } = await supabase.auth.getSession()

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: true })

    if (data) setProfiles(data)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleCreateAndJoin() {
    if (!nickname.trim()) return alert('El nombre es obligatorio')
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()

    let avatar_url = null

    if (avatarFile) {
      const fileName = `avatar_${Date.now()}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
        avatar_url = data.publicUrl
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ nickname, avatar_url, user_id: session?.user?.id }])
      .select()
      .single()

    if (!error) {
      await supabase.from('room_players').insert([{
        room_id: roomId,
        profile_id: data.id,
        stack: 0,
      }])
      onSelect(data)
    }

    setLoading(false)
  }

  async function handleJoinWithProfile(profile) {
    const { error } = await supabase.from('room_players').insert([{
      room_id: roomId,
      profile_id: profile.id,
      stack: 0,
    }])

    if (error) console.error('Error al unirse:', error.message)
    else onSelect(profile)
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>¿Con qué perfil juegas?</h2>

      {!showNew ? (
        <>
          {profiles.length > 0 && (
            <div style={styles.grid}>
              {profiles.map(p => (
                <button
                  key={p.id}
                  style={styles.profileBtn}
                  onClick={() => handleJoinWithProfile(p)}
                >
                  <img
                    src={p.avatar_url || '/default-avatar.png'}
                    alt={p.nickname}
                    style={styles.avatar}
                  />
                  <span style={styles.name}>{p.nickname}</span>
                </button>
              ))}
            </div>
          )}

          <button style={styles.newBtn} onClick={() => setShowNew(true)}>
            + Crear perfil nuevo
          </button>
        </>
      ) : (
        <div style={styles.form}>
          <div style={styles.avatarContainer}>
            <img
              src={preview || '/default-avatar.png'}
              alt="avatar"
              style={styles.avatarPreview}
            />
            <div style={styles.avatarBtns}>
              <button style={styles.smallBtn} onClick={() => fileInputRef.current.click()}>
                📁 Galería
              </button>
              <button style={styles.smallBtn} onClick={() => cameraInputRef.current.click()}>
                📷 Cámara
              </button>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <input
            type="file"
            accept="image/*"
            capture="user"
            ref={cameraInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <input
            style={styles.input}
            type="text"
            placeholder="Nombre de usuario"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
          />

          <div style={styles.footer}>
            <button style={styles.cancelBtn} onClick={() => setShowNew(false)}>
              Cancelar
            </button>
            <button style={styles.joinBtn} onClick={handleCreateAndJoin} disabled={loading}>
              {loading ? 'Guardando...' : 'Unirse'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    gap: '20px',
  },
  title: {
    fontSize: '22px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '12px',
    width: '100%',
    maxWidth: '360px',
  },
  profileBtn: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: '#fff',
    padding: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  name: {
    fontSize: '13px',
    fontWeight: 'bold',
  },
  newBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '2px dashed rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: '#fff',
    padding: '14px 24px',
    cursor: 'pointer',
    fontSize: '15px',
    width: '100%',
    maxWidth: '360px',
  },
  form: {
    width: '100%',
    maxWidth: '340px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  avatarPreview: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#333',
  },
  avatarBtns: {
    display: 'flex',
    gap: '8px',
  },
  smallBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  input: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: '#fff',
    padding: '14px',
    fontSize: '16px',
    width: '100%',
  },
  footer: {
    display: 'flex',
    gap: '8px',
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

export default SelectProfile
