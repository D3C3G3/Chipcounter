import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Spectator from './pages/Spectator'
import Profiles from './pages/Profiles'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game/:roomId" element={<Game />} />
        <Route path="/spectator/:roomId" element={<Spectator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
