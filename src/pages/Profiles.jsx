!import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import ProfileCard from './ProfileCard'
import ProfileForm from './ProfileForm'

function Profiles() {
  const [profiles, setProfiles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)

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
