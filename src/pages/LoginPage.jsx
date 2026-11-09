/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { initialPatients, initials, demoAccounts, postedResults, appointments } from '../data/demoData.js'
import { Avatar, Button, PageHeading, Metric, PanelHeader, QuickAction, AttentionItem, StatusTag, Detail, EncounterLine } from '../components/ui.jsx'

function StaffLogin({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const roles = ['Doctor', 'Nurse', 'Medical laboratory scientist', 'Physiotherapist', 'Radiologist', 'Front desk / Reception', 'Billing', 'Pharmacy', 'Store / Inventory', 'Other staff']
  const submit = (event) => {
    event.preventDefault()
    if (!role) { setMessage('Select your department to continue.'); return }
    const account = demoAccounts.find((item) => item.email === email.trim().toLowerCase() && item.password === password && item.role === role)
    if (!account) {
      setMessage('Those details do not match a demo account. Choose a role account below.')
      return
    }
    setMessage('')
    onSignIn(role)
  }
  return <main className="login-page">
    <section className="login-aside" aria-label="Careflow information">
      <div className="login-brand"><div className="brand-mark"><span></span><span></span><span></span></div><span>care<span className="brand-light">flow</span></span></div>
      <div className="login-aside-copy"><span className="login-overline"><i/> CARE THAT CONNECTS</span><h1>Every team.<br/>One connected<br/><em>care experience.</em></h1><p>A calm, secure workspace for the people who make better care possible.</p></div>
      <div className="login-quote"><div className="login-quote-mark">“</div><p>When every part of the care team is connected, patients feel the difference.</p><div className="login-quote-by"><span className="quote-avatar">CF</span><span><b>Careflow team</b><small>Clinical operations</small></span></div></div>
      <div className="login-aside-foot"><span>BUILT FOR YOUR WHOLE CARE TEAM</span><div><i/> Clinical <i/> Diagnostics <i/> Operations</div></div>
      <div className="login-decoration login-decoration-one"/><div className="login-decoration login-decoration-two"/>
    </section>
    <section className="login-main"><div className="login-top-note"><span className="secure-lock">⌑</span> Secure staff access</div>
      <div className="login-card"><div className="login-heading"><span className="login-kicker">WELCOME BACK</span><h2>Sign in to your workspace</h2><p>Use your staff account to access your department.</p></div>
        <div className="demo-account"><div className="demo-account-heading"><b>Role demo accounts</b><span>Choose an account to fill the sign-in form</span></div><div className="demo-account-list">{demoAccounts.map((account) => <div className="demo-account-item" key={account.email}><span><b>{account.role}</b><small>{account.email} · {account.password}</small></span><button type="button" onClick={() => { setEmail(account.email); setPassword(account.password); setRole(account.role); setMessage('') }}>Use</button></div>)}</div></div>
        <form className="login-form" onSubmit={submit}>
          <label>Work email<input type="email" autoComplete="username" placeholder="you@yourclinic.com" value={email} onChange={(e) => setEmail(e.target.value)} required/></label>
          <label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required/><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
          <label>Department or role<select value={role} onChange={(e) => setRole(e.target.value)} required><option value="" disabled>Select your department</option>{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
          {message && <p className="login-error" role="alert">{message}</p>}
          <div className="login-options"><label className="remember-option"><input type="checkbox"/> <span>Remember me</span></label><button type="button" className="login-link" onClick={() => setMessage('Contact your clinic administrator to reset your password.')}>Forgot password?</button></div>
          <button className="login-submit" type="submit">Sign in <span>→</span></button>
        </form>
        <div className="login-help"><span className="help-round">?</span><span>Need access? <button onClick={() => setMessage('Contact your clinic administrator to request staff access.')} type="button">Contact your administrator</button></span></div>
      </div><footer className="login-footer"><span>© 2026 Careflow Health</span><span><i/> Your information is protected</span></footer>
    </section>
  </main>
}

export { StaffLogin }
