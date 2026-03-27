import React, { createContext, useContext, useState } from 'react'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [accountId, setAccountId] = useState('mon-compte')
  const [projectId, setProjectId] = useState('fr_FR')
  const [environment, setEnvironment] = useState('DEV')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [token, setToken] = useState(null)
  const [projectName, setProjectName] = useState('Mon projet Wallet')
  const [userIdentifier, setUserIdentifier] = useState('USER-001')
  const [cardCreated, setCardCreated] = useState(false)

  const isAuthenticated = !!token

  const baseApiUrl = environment === 'DEV'
    ? `https://qlf-api.captainwallet.com`
    : `https://api.captainwallet.com`

  const enrollBaseUrl = environment === 'DEV'
    ? `https://qlf-${accountId}.captainwallet.com`
    : `https://${accountId}.captainwallet.com`

  const tokenEndpoint = `${baseApiUrl}/oauth/token`

  const updateEndpoint = accountId && projectId && userIdentifier
    ? `${baseApiUrl}/v1/${accountId}/${projectId}/pass-owners/${userIdentifier}`
    : `${baseApiUrl}/v1/{accountID}/{projectID}/pass-owners/{identifier}`

  function generateToken() {
    // Simulated fixed JWT token — no expiry for training purposes
    return `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIke2NsaWVudElkfSIsImp0aSI6InNpbXVsYXRlZCIsImlhdCI6MTcwMDAwMDAwMCwibmJmIjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDM2MDAsInN1YiI6IiIsInNjb3BlcyI6WyJwYXNzLW93bmVyIiwid2ViaG9va3MiXX0.SIMULATED_SIGNATURE`
  }

  function simulateAuth() {
    const t = generateToken()
    setToken(t)
    return t
  }

  function reset() {
    setToken(null)
    setCardCreated(false)
  }

  return (
    <ProjectContext.Provider value={{
      accountId, setAccountId,
      projectId, setProjectId,
      environment, setEnvironment,
      clientId, setClientId,
      clientSecret, setClientSecret,
      token, setToken,
      projectName, setProjectName,
      userIdentifier, setUserIdentifier,
      cardCreated, setCardCreated,
      isAuthenticated,
      baseApiUrl,
      enrollBaseUrl,
      tokenEndpoint,
      updateEndpoint,
      simulateAuth,
      reset,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
