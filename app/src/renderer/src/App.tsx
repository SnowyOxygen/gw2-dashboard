import { useState, useEffect } from 'react'
import HomeMenu from './components/HomeMenu'
import SetupPage from './components/SetupPage'

function App(): React.JSX.Element {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)

  useEffect(() => {
    checkApiKey()
  }, [])

  const checkApiKey = async () => {
    const hasKey = await window.api.settings.hasApiKey()
    setHasApiKey(hasKey)
  }

  const handleSetupComplete = () => {
    setHasApiKey(true)
  }

  // Loading state
  if (hasApiKey === null) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: 'var(--ev-c-text-2)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      {hasApiKey ? (
        <HomeMenu />
      ) : (
        <SetupPage onSetupComplete={handleSetupComplete} />
      )}
    </>
  )
}

export default App
