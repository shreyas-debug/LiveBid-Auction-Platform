import React from 'react'

function App() {
  return (
    <div className="app">
      <header>
        <h1>LiveBid</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </nav>
      </header>
      <main>
        {/* Our pages will be rendered here later */}
        <h2>Welcome to LiveBid!</h2>
      </main>
    </div>
  )
}

export default App