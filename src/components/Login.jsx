import { supabase } from '../supabaseClient'

function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) console.error('Error al iniciar sesión con Google:', error.message)
  }

  return (
    <div className="login-container">
      <button onClick={handleGoogleLogin} className="google-login-btn">
        Iniciar sesión con Google
      </button>
    </div>
  )
}

export default Login
