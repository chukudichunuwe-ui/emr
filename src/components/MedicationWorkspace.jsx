import { useEffect, useState } from 'react'
import { Button } from './ui.jsx'
import { demoAccounts } from '../data/demoData.js'

function MedicationWorkspace({ patient, staffRole, view, orders = [], onAction, onPrescribe, onUpdateOrder }) {
  return view === 'prescribe' && staffRole === 'Doctor'
    ? <PrescriptionForm key={patient.id} patient={patient} onPrescribe={onPrescribe}/>
    : <DrugChart key={patient.id} patient={patient} staffRole={staffRole} orders={orders} onAction={onAction} onUpdateOrder={onUpdateOrder}/>
}

function PrescriptionForm({ patient, onPrescribe }) {
  const localDateTime = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  const createEmptyForm = () => ({ medication: '', dose: '', route: 'Oral', frequency: 'Once daily', duration: '', quantity: '', refills: '0', instructions: '', scheduledAt: localDateTime(new Date(Date.now() + 5 * 60000)) })
  const [form, setForm] = useState(createEmptyForm)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    onPrescribe({
      id: `RX-${Date.now()}`, patientId: patient.id, patientName: patient.name,
      medication: form.medication.trim(), dose: form.dose.trim(), route: form.route,
      frequency: form.frequency, duration: form.duration.trim(), quantity: form.quantity,
      refills: form.refills, instructions: form.instructions.trim(), prescribedBy: 'Dr. Alex Morgan',
      prescribedAt: new Date().toISOString(), scheduledAt: new Date(form.scheduledAt).toISOString(), status: 'Prescribed', administeredAt: '',
      administeredBy: '', signedAt: '', signedBy: '',
    })
    setForm(createEmptyForm())
    event.currentTarget.reset()
  }
  return <div className="medication-page prescribe-page">
    <header className="medication-page-heading"><div className="medication-heading-icon">Rx</div><div><span className="eyebrow">PRESCRIPTION ORDER</span><h2>Prescribe medication</h2><p>Create a clear order for the pharmacy and care team.</p></div><span className="medication-patient-chip">{patient.name}<small>{patient.id}</small></span></header>
    <form className="prescription-form" onSubmit={submit}>
      <section className="prescription-safety"><div className="safety-heading"><span className="safety-shield">!</span><div><b>Patient safety check</b><small>Review this information before completing the prescription.</small></div></div><div className="safety-details"><span><small>KNOWN ALLERGIES</small><b>{patient.allergies || 'Not recorded'}</b></span><span><small>CURRENT MEDICATION</small><b>{patient.medication || 'None recorded'}</b></span></div></section>
      <section className="prescription-section"><div className="prescription-section-title"><span>01</span><div><b>Medication details</b><small>Specify the medication and administration schedule.</small></div></div><div className="prescription-grid"><label className="prescription-wide">Medication name<input required value={form.medication} onChange={(event) => update('medication', event.target.value)} placeholder="Drug name and formulation"/></label><label>Dose<input required value={form.dose} onChange={(event) => update('dose', event.target.value)} placeholder="e.g. 500 mg"/></label><label>Route<select value={form.route} onChange={(event) => update('route', event.target.value)}><option>Oral</option><option>IV</option><option>IM</option><option>Subcutaneous</option><option>Inhaled</option><option>Topical</option><option>Other</option></select></label><label>Frequency<select value={form.frequency} onChange={(event) => update('frequency', event.target.value)}><option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>Every 4 hours</option><option>Every 6 hours</option><option>As needed</option><option>Once</option></select></label><label className="prescription-wide">First dose due<input type="datetime-local" required value={form.scheduledAt} onChange={(event) => update('scheduledAt', event.target.value)}/></label></div></section>
      <section className="prescription-section"><div className="prescription-section-title"><span>02</span><div><b>Supply and instructions</b><small>Set the quantity and include directions for the patient.</small></div></div><div className="prescription-grid"><label>Duration<input value={form.duration} onChange={(event) => update('duration', event.target.value)} placeholder="e.g. 7 days"/></label><label>Quantity<input required type="number" min="1" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} placeholder="Number of units"/></label><label>Refills<select value={form.refills} onChange={(event) => update('refills', event.target.value)}><option>0</option><option>1</option><option>2</option><option>3</option></select></label><label className="prescription-wide">Patient instructions<textarea value={form.instructions} onChange={(event) => update('instructions', event.target.value)} placeholder="How and when should the patient take this medication?"/></label></div></section>
      <footer className="prescription-actions"><span>Submitting sends this prescription to the Pharmacy queue.</span><Button kind="primary" type="submit">Prescribe and notify pharmacy</Button></footer>
    </form>
  </div>
}

function DrugChart({ patient, staffRole, orders, onAction, onUpdateOrder }) {
  const [givingOrderId, setGivingOrderId] = useState('')
  const [signatureOrderId, setSignatureOrderId] = useState('')
  const [givenAt, setGivenAt] = useState(new Date().toISOString().slice(0, 16))
  const [administrationNote, setAdministrationNote] = useState('')
  const [nursePassword, setNursePassword] = useState('')
  const [signatureError, setSignatureError] = useState('')
  const [showSpreadsheet, setShowSpreadsheet] = useState(false)
  const patientOrders = (Array.isArray(orders) ? orders : []).filter((order) => order?.patientId === patient.id)
  const confirmGiven = (event, order) => {
    event.preventDefault()
    onUpdateOrder(order.id, { status: 'Given - awaiting nurse signature', administeredAt: new Date(givenAt).toISOString(), administeredBy: 'Nurse', administrationNote: administrationNote.trim() })
    setGivingOrderId('')
    setAdministrationNote('')
    setSignatureOrderId(order.id)
    onAction(`${order.medication} recorded as given. Nurse signature required.`)
  }
  const signAdministration = (event, order) => {
    event.preventDefault()
    const nurseAccount = demoAccounts.find((account) => account.role === 'Nurse')
    if (!nurseAccount || nursePassword !== nurseAccount.password) { setSignatureError('Password did not match the Nurse account.'); return }
    onUpdateOrder(order.id, { status: 'Administered', signedAt: new Date().toISOString(), signedBy: 'Nurse' })
    setSignatureOrderId('')
    setNursePassword('')
    setSignatureError('')
    onAction(`${order.medication} administration signed by Nurse`)
  }
  const canViewSpreadsheet = ['Doctor', 'Nurse', 'Pharmacy'].includes(staffRole)
  return <div className={`medication-page drug-chart-page ${showSpreadsheet ? 'drug-spreadsheet-fullscreen' : ''}`}>
    <header className="medication-page-heading"><div className="medication-heading-icon chart-icon">Rx</div><div><span className="eyebrow">MEDICATION ADMINISTRATION RECORD</span><h2>{showSpreadsheet ? 'Medication administration sheet' : 'Drug chart'}</h2><p>{showSpreadsheet ? 'Scheduled doses, administration times, and signing status.' : 'Review prescribed medications and document each administration.'}</p></div><span className="drug-chart-count">{patientOrders.length}<small>{patientOrders.length === 1 ? 'order' : 'orders'}</small></span>{canViewSpreadsheet && <Button kind="secondary" onClick={() => setShowSpreadsheet((current) => !current)}>{showSpreadsheet ? 'Back to drug chart' : 'Open spreadsheet'}</Button>}</header>
    {showSpreadsheet ? <DrugChartSpreadsheet patient={patient} orders={patientOrders}/> : <>
    <section className="drug-chart-patient"><div className="patient-identity-mark">{patient.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="drug-patient-name"><small>SELECTED PATIENT</small><b>{patient.name}</b><span>{patient.id}</span></div><div className="drug-patient-allergies"><small>ALLERGIES</small><b>{patient.allergies || 'Not recorded'}</b></div></section>
    <div className="drug-chart-list">{patientOrders.length ? patientOrders.map((order) => <DrugOrder key={order.id} order={order} staffRole={staffRole} givingOrderId={givingOrderId} setGivingOrderId={setGivingOrderId} givenAt={givenAt} setGivenAt={setGivenAt} administrationNote={administrationNote} setAdministrationNote={setAdministrationNote} signatureOrderId={signatureOrderId} setSignatureOrderId={setSignatureOrderId} nursePassword={nursePassword} setNursePassword={setNursePassword} signatureError={signatureError} setSignatureError={setSignatureError} onConfirmGiven={confirmGiven} onSign={signAdministration}/>) : <div className="drug-chart-empty"><span className="empty-rx-icon">Rx</span><b>No prescriptions yet</b><p>Prescriptions from the doctor will appear here for review and administration.</p></div>}</div>
    </>}
  </div>
}

function DrugChartSpreadsheet({ patient, orders }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(interval)
  }, [])
  const statusFor = (order) => {
    const dueAt = new Date(order.scheduledAt || order.prescribedAt).getTime()
    const givenAt = order.administeredAt ? new Date(order.administeredAt).getTime() : null
    if (givenAt) {
      return givenAt <= dueAt + 15 * 60000 ? { label: 'Given on time', tone: 'on-time' } : { label: 'Given late', tone: 'late' }
    }
    if (Number.isFinite(dueAt) && dueAt <= now) return { label: 'Not given', tone: 'not-given' }
    return { label: 'Scheduled', tone: 'scheduled' }
  }
  const format = (value) => { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '—' }
  return <section className="drug-spreadsheet-panel"><div className="drug-sheet-caption"><div><b>{patient.name}</b><span>{patient.id} · Medication administration record</span></div><div className="drug-sheet-legend"><span><i className="on-time"/>On time</span><span><i className="late"/>Late</span><span><i className="not-given"/>Not given</span></div></div><div className="drug-sheet-scroll"><table className="drug-spreadsheet"><thead><tr><th>Medication</th><th>Dose / route</th><th>Frequency</th><th>Scheduled for</th><th>Given at</th><th>Given by</th><th>Nurse signature</th><th>Administration status</th></tr></thead><tbody>{orders.length ? orders.map((order) => { const timing = statusFor(order); return <tr key={order.id}><td><b>{order.medication || 'Medication'}</b><small>{order.id}</small></td><td>{order.dose || '—'}<small>{order.route || 'Route not set'}</small></td><td>{order.frequency || '—'}<small>{order.duration || ''}</small></td><td>{format(order.scheduledAt || order.prescribedAt)}</td><td>{format(order.administeredAt)}</td><td>{order.administeredBy || '—'}</td><td>{order.signedAt ? <span className="signature-cell">Signed by {order.signedBy || 'Nurse'}<small>{format(order.signedAt)}</small></span> : '—'}</td><td><span className={`sheet-status ${timing.tone}`}>{timing.label}</span></td></tr> }) : <tr><td className="drug-sheet-empty" colSpan="8">No prescriptions have been added to this chart.</td></tr>}</tbody></table></div><p className="drug-sheet-note">A dose is considered on time when administered between 15 minutes before and 15 minutes after its scheduled time.</p></section>
}

function DrugOrder({ order, staffRole, givingOrderId, setGivingOrderId, givenAt, setGivenAt, administrationNote, setAdministrationNote, signatureOrderId, setSignatureOrderId, nursePassword, setNursePassword, signatureError, setSignatureError, onConfirmGiven, onSign }) {
  const status = order.status || 'Prescribed'
  const statusTone = status === 'Administered' ? 'drug-given' : status.startsWith('Given') ? 'drug-awaiting-sign' : 'drug-prescribed'
  const stamp = (value) => { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Time not recorded' }
  return <article className="drug-order"><div className="drug-order-top"><span className="drug-order-icon">Rx</span><div className="drug-order-name"><b>{order.medication || 'Medication'} <i>{order.dose || 'Dose not recorded'}</i></b><small>{[order.route, order.frequency, order.duration, order.quantity ? `Qty ${order.quantity}` : ''].filter(Boolean).join(' · ') || 'Prescription details not recorded'}</small></div><span className={`drug-order-status ${statusTone}`}>{status}</span></div><div className="drug-order-meta"><span><small>PRESCRIBED BY</small><b>{order.prescribedBy || 'Not recorded'}</b></span><span><small>ORDERED</small><b>{stamp(order.prescribedAt)}</b></span>{order.refills !== undefined && <span><small>REFILLS</small><b>{order.refills}</b></span>}</div>{order.instructions && <div className="drug-order-instructions"><small>PATIENT INSTRUCTIONS</small><p>{order.instructions}</p></div>}{order.administrationNote && <div className="drug-order-instructions"><small>ADMINISTRATION NOTE</small><p>{order.administrationNote}</p></div>}{order.administeredAt && <div className="drug-administration-stamp"><span>Given {stamp(order.administeredAt)} by {order.administeredBy || 'Nurse'}</span>{order.signedAt && <b>Signed by {order.signedBy || 'Nurse'} · {stamp(order.signedAt)}</b>}</div>}
    {staffRole === 'Nurse' && status === 'Prescribed' && <div className="drug-order-actions"><Button kind="primary" onClick={() => { setGivingOrderId(order.id); setGivenAt(new Date().toISOString().slice(0, 16)) }}>Record medication given</Button></div>}
    {staffRole === 'Nurse' && status.startsWith('Given') && <div className="nurse-signature-section"><div><b>Administration recorded</b><small>Enter your password to sign this medication record.</small></div>{signatureOrderId === order.id ? <form className="nurse-signature-form" onSubmit={(event) => onSign(event, order)}><label>Nurse password<input type="password" autoComplete="current-password" value={nursePassword} onChange={(event) => { setNursePassword(event.target.value); setSignatureError('') }} required/></label>{signatureError && <small role="alert">{signatureError}</small>}<Button kind="primary" type="submit">Sign administration</Button></form> : <Button kind="primary" onClick={() => { setSignatureOrderId(order.id); setSignatureError('') }}>Sign with nurse password</Button>}</div>}
    {givingOrderId === order.id && staffRole === 'Nurse' && <form className="nurse-giving-form" onSubmit={(event) => onConfirmGiven(event, order)}><label>Date and time given<input type="datetime-local" value={givenAt} onChange={(event) => setGivenAt(event.target.value)} required/></label><label>Administration note<textarea value={administrationNote} onChange={(event) => setAdministrationNote(event.target.value)} placeholder="Optional note about the administration"/></label><div className="nurse-giving-actions"><Button type="button" onClick={() => setGivingOrderId('')}>Cancel</Button><Button kind="primary" type="submit">Confirm given</Button></div></form>}
  </article>
}

export { MedicationWorkspace }
