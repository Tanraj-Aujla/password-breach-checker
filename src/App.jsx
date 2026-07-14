import { useState } from 'react'
import './App.css'

// simple password strengh checker
function checkStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { label: 'Weak', color: '#f87171', score: 1 }
  if (score <= 3) return { label: 'Medium', color: '#fbbf24', score: 2 }
  return { label: 'Strong', color: '#34d399', score: 3 }
}

// function to hash the users password using browser built in web crypto api 
async function sha1(str) {
  const buffer = new TextEncoder().encode(str) // convert into bytes
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer) // creates the sha-1 hash
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // format the hash for the api
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

// function to check for the breach using the have
async function checkBreach(password) {

// get the password the user enters, get the first 5 characters and send to the API (full password hash never leaves browser)
  const hash = await sha1(password)
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
  
  // get the api responise and split into an array
  const text = await response.text()
  const lines = text.split('\n')

  // loop through each line checking each one and compare to see if any match.
  for (const line of lines) {
    const [hashSuffix, count] = line.split(':')

    // return 0 on no match otherwise return the # of breaches
    if (hashSuffix.trim() === suffix) return parseInt(count)
  }
  return 0
}


function App() {
  const [password, setPassword] = useState('') // text in the input box
  const [breachCount, setBreachCount] = useState(null) // result from the API
  const [loading, setLoading] = useState(false) // true while checking

  const strength = password.length > 0 ? checkStrength(password) : null

  // runs when the button is clicked
  async function handleCheck() {
    if (!password) return
    setLoading(true)
    setBreachCount(null)
    const count = await checkBreach(password)
    setBreachCount(count)
    setLoading(false)
  }

  return (
    <div className="container">
      <h1>Password Checker</h1>
      <p className="subtitle">Check your password strength and see if it's been in a data breach.</p>

      <input
        type="password"
        placeholder="Enter a password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* strength bars */}
      {strength && (
        <div className="strength-bar-wrap">
          <div className="strength-bars">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="bar"
                style={{ background: i <= strength.score ? strength.color : '#2a2a2a' }}
              />
            ))}
          </div>
          <span className="strength-label">
            Strength: <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
          </span>
        </div>
      )}

      <button onClick={handleCheck} disabled={loading}>
        {loading ? 'Checking...' : 'Check for Breaches'}
      </button>

      {/* breach result */}
      {breachCount !== null && (
        <div className="result">
          {breachCount === 0 ? (
            <span style={{ color: '#34d399', fontWeight: 600 }}>✓ Not found in any known breaches</span>
          ) : (
            <span style={{ color: '#f87171', fontWeight: 600 }}>✗ Found in {breachCount.toLocaleString()} known breaches</span>
          )}
        </div>
      )}
    </div>
  )
}

export default App