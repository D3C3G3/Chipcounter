function ProfileCard({ profile, onEdit, onDelete }) {
  return (
    <div style={styles.card}>
      <img
        src={profile.avatar_url || '/default-avatar.png'}
        alt={profile.nickname}
        style={styles.avatar}
      />
      <p style={styles.nickname}>{profile.nickname}</p>
      <div style={styles.actions}>
        <button style={styles.editBtn} onClick={onEdit}>✏️</button>
        <button style={styles.deleteBtn} onClick={onDelete}>🗑️</button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#333',
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: '14px',
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
  }
}

export default ProfileCard
