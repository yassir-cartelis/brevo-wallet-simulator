import React, { useState } from 'react'
import { ProjectProvider } from './context/ProjectContext.jsx'
import Home from './pages/Home.jsx'
import Simulation from './pages/Simulation.jsx'
import './App.css'

export default function App() {
  const [page, setPage] = useState('home') // home | simulation

  return (
    <ProjectProvider>
      {page === 'home' && (
        <Home onStart={() => setPage('simulation')} />
      )}
      {page === 'simulation' && (
        <Simulation onHome={() => setPage('home')} />
      )}
    </ProjectProvider>
  )
}
