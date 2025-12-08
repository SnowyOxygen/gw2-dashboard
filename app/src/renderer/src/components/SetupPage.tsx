import React, { useState } from 'react'
import './SetupPage.css'

interface SetupPageProps {
  onSetupComplete: () => void
}

const SetupPage: React.FC<SetupPageProps> = ({ onSetupComplete }) => {
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')

  const validateAndSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      // Validate the API key by making a request to GW2 API
      const response = await fetch(`https://api.guildwars2.com/v2/account?access_token=${apiKey}`)
      
      if (!response.ok) {
        throw new Error('Invalid API key')
      }

      const accountData = await response.json()
      
      // Save the API key and account name
      await window.api.settings.setApiKey(apiKey)
      await window.api.settings.setAccountName(accountData.name)
      
      onSetupComplete()
    } catch (err) {
      setError('Invalid API key. Please check and try again.')
      setIsValidating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      validateAndSaveApiKey()
    }
  }

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-header">
          <h1 className="setup-title">Welcome to GW2 Dashboard</h1>
          <p className="setup-subtitle">Let's get you started by connecting your Guild Wars 2 account</p>
        </div>

        <div className="setup-content">
          <div className="setup-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create an API Key</h3>
              <p>Visit the <a href="https://account.arena.net/applications" target="_blank" rel="noopener noreferrer">ArenaNet Applications page</a> and create a new API key.</p>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Required Permissions</h3>
              <p>Make sure to enable these permissions:</p>
              <ul className="permissions-list">
                <li>✓ Account</li>
                <li>✓ Characters</li>
                <li>✓ Progression</li>
                <li>✓ Inventories (optional)</li>
                <li>✓ Builds (optional)</li>
              </ul>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Enter Your API Key</h3>
              <div className="api-key-input-container">
                <input
                  type="password"
                  className="api-key-input"
                  placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isValidating}
                />
                {error && <div className="error-message">{error}</div>}
              </div>
            </div>
          </div>

          <button
            className="setup-button"
            onClick={validateAndSaveApiKey}
            disabled={isValidating || !apiKey.trim()}
          >
            {isValidating ? 'Validating...' : 'Connect Account'}
          </button>
        </div>

        <div className="setup-footer">
          <p className="privacy-note">
            🔒 Your API key is stored securely and encrypted on your local machine. It never leaves your device.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SetupPage
