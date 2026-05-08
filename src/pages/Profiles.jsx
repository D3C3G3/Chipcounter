import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import ProfileCard from '../components/ProfileCard'
import ProfileForm from '../components/ProfileForm'

function Profiles() {
  const [profiles, setProfiles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setProfiles(data)
  }

  function handleEdit(profile) {
    setEditingProfile(profile)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditingProfile(null)
  }

  async function handleDelete(id) {
    await supabase.from('profiles').delete().eq('id', id)
    fetchProfiles()
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mis Perfiles</h1>

      <div style={styles.grid}>
        {profiles.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onEdit={() => handleEdit(profile)}
            onDelete={() => handleDelete(profile.id)}
          />
        ))}

        <button style={styles.addButton} onClick={() => setShowForm(true)}>
          + Nuevo Perfil
        </button>
      </div>

      {showForm && (
        <ProfileForm
          profile={editingProfile}
          onClose={handleClose}
          onSave={() => {
            fetchProfiles()
            handleClose()
          }}
        />
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '600px',
    margin: '
