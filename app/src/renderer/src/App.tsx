import { useState, useEffect } from 'react'
import HomeMenu from './components/HomeMenu'
import SetupPage from './components/SetupPage'
import CardWindow from './components/CardWindow'

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

  const handleResetSetup = () => {
    setHasApiKey(false)
  }

  // Check if we're in a card window
  const hash = window.location.hash
  const cardMatch = hash.match(/#\/card\/(.+)/)
  if (cardMatch) {
    const cardId = cardMatch[1]
    return <CardWindow cardId={cardId} />
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
        <HomeMenu onResetSetup={handleResetSetup} />
      ) : (
        <SetupPage onSetupComplete={handleSetupComplete} />
      )}
    </>
  )
}

export default App
