import { useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

function ProfileForm({ profile, onClose, onSave }) {
  const [nickname, setNickname] = useState(profile?.nickname || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(profile?.avatar_url || null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef()
  const cameraInputRef = useRef()

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!nickname.trim()) return alert('El apodo es obligatorio')
    setLoading(true)

    let avatar_url = profile?.avatar_url || null

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

    if (profile) {
      await supabase
        .from('profiles')
        .update({ nickname, avatar_url })
        .eq('id', profile.id)
    } else {
      await supabase
        .from('profiles')
        .insert([{ nickname, avatar_url }])
    }

    setLoading(false)
    onSave()
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>
          {profile ? 'Editar Perfil' : 'Nuevo Perfil'}
        </h2>

        <div style={styles.avatarContainer}>
          <img
            src={preview || '/default-avatar.png'}
            alt="avatar"
            style={styles.avatar}
          />
          <div style={styles.avatarButtons}>
            <button style={styles.btn} onClick={() => fileInputRef.current.click()}>
              📁 Galería
            </button>
            <button style={styles.btn} onClick={() => cameraInputRef.current.click()}>
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
          placeholder="Apodo"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    textAlign: 'center',
    fontSize: '20px',
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#333',
  },
  avatarButtons: {
    display: 'flex',
    gap: '8px',
  },
  btn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  input: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    padding: '12px',
    fontSize: '16px',
    width: '100%',
  },
  footer: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '10px 16px',
    cursor: 'pointer',
  },
  saveBtn: {
    background: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '10px 16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
}

export default ProfileForm
