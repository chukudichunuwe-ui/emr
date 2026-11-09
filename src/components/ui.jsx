import { initials } from '../data/demoData.js'

function Icon({ name, size = 18 }) {
  const paths = {
    Dashboard: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="11" width="7" height="10" rx="2" /><rect x="3" y="14" width="8" height="7" rx="2" /></>,
    Schedule: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h7" /></>,
    Patients: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M17 11h6" /></>,
    Encounters: <><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5H8Z" /><path d="M14 3v6h7M8 14h8M8 17h5" /></>,
    Inbox: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="m4 8 8 6 8-6M3 15h5l2 3h4l2-3h5" /></>,
    'Lab results': <><path d="M9 3h6M10 3v7L5 19a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 16h8" /><path d="m10 14 2 2 3-4" /></>,
    Medications: <><path d="m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0) scale(.92)" /></>,
    Documents: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    Billing: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 10h18M7 15h3M16 3v4" /></>,
    Reports: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.Documents}</svg>
}

function Avatar({ name, color = 'blue', size = '' }) { return <div className={`avatar ${color} ${size}`}>{initials(name)}</div> }

function Button({ children, kind = 'secondary', ...props }) { return <button className={`button ${kind}`} {...props}>{children}</button> }

function PageHeading({ eyebrow, title, description, action }) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div> }

function Metric({ label, value, change, note, icon, tone, progress }) { return <div className="metric-card"><div className="metric-top"><span>{label}</span><i className={`metric-icon ${tone}`}>{icon}</i></div><div className="metric-value">{value}</div><div className="metric-bottom">{progress !== undefined ? <div className="metric-progress"><i style={{ width: `${progress}%` }} /></div> : <b className={tone}>{change}</b>}<span>{note}</span></div></div> }

function PanelHeader({ title, subtitle, action }) { return <div className="panel-header"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div> }

function QuickAction({ icon, title, detail, onClick }) { return <button className="quick-action" onClick={onClick}><i>{icon}</i><span><b>{title}</b><small>{detail}</small></span><span className="quick-arrow">→</span></button> }

function AttentionItem({ icon, title, detail, tone, onClick }) { return <button className="attention-item" onClick={onClick}><i className={tone}>{icon}</i><span><b>{title}</b><small>{detail}</small></span><span>›</span></button> }

function StatusTag({ status }) { const kind = status.toLowerCase().replaceAll(' ', '-'); return <span className={`status-tag ${kind}`}><i />{status}</span> }

function Detail({ label, value }) { return <div className="detail-row"><span>{label}</span><b>{value}</b></div> }

function EncounterLine({ date, title, subtitle, state }) { return <div className="encounter-line"><span className="encounter-date">{date}</span><span className="encounter-dot" /><div><b>{title}</b><small>{subtitle}</small></div><span className={`encounter-state ${state === 'Signed' ? 'signed' : ''}`}>{state}</span></div> }

export { Icon, Avatar, Button, PageHeading, Metric, PanelHeader, QuickAction, AttentionItem, StatusTag, Detail, EncounterLine }
