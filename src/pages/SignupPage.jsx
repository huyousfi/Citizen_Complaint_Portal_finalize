import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.jpeg'

export default function SignupPage({ signupData, setSignupData, onSubmit, signupError, isSubmitting }) {
  const handleChange = (event) => {
    const { name, value } = event.target
    setSignupData((current) => ({ ...current, [name]: value }))
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo} alt="CivicPulse logo" className="brand-logo brand-logo--large" />
          <div>
            <p className="eyebrow">Create account</p>
            <h1>Join CivicPulse</h1>
          </div>
        </div>

        <p className="login-intro">
          Register as a resident to report issues, track service requests, and stay updated on progress.
        </p>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Full name
            <input name="name" value={signupData.name} onChange={handleChange} placeholder="Your full name" />
          </label>

          <label>
            Email address
            <input type="email" name="email" value={signupData.email} onChange={handleChange} placeholder="you@example.com" />
          </label>

          <label>
            Password
            <input type="password" name="password" value={signupData.password} onChange={handleChange} placeholder="Create a password" />
          </label>

          <label>
            Confirm password
            <input type="password" name="confirmPassword" value={signupData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
          </label>

          {signupError ? <div className="message error">{signupError}</div> : null}

          <button className="primary-button wide" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create citizen account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
