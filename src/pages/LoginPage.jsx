import logo from '../assets/logo.jpeg'

export default function LoginPage({ loginData, setLoginData, loginError, onSubmit }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo} alt="CivicPulse logo" className="brand-logo brand-logo--large" />
          <div>
            <p className="eyebrow">Township operations</p>
            <h1>CivicPulse</h1>
          </div>
        </div>

        <p className="login-intro">
          Report local issues, track progress, and manage community services from one simple portal.
        </p>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Email address
            <input
              type="email"
              value={loginData.email}
              onChange={(event) =>
                setLoginData((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="name@city.gov"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={loginData.password}
              onChange={(event) =>
                setLoginData((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Enter password"
            />
          </label>

          {loginError ? <div className="message error">{loginError}</div> : null}

          <button className="primary-button wide" type="submit">
            Sign in to portal
          </button>
        </form>

      </div>
    </div>
  )
}
