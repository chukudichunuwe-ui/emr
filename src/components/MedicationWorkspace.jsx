import { useState } from 'react'
import { Button, PanelHeader } from './ui.jsx'
import { demoAccounts } from '../data/demoData.js'

function MedicationWorkspace({ patient, staffRole, view, orders = [], onAction, onPrescribe, onUpdateOrder }) {
  return view === 'prescribe' && staffRole === 'Doctor'
    ? <PrescriptionForm patient={patient} onPrescribe={onPrescribe}/>
    : <DrugChart patient={patient} staffRole={staffRole} orders={orders} onAction={onAction} onUpdateOrder={onUpdateOrder}/>
}

function PrescriptionForm({ patient, onPrescribe }) {
  const [form, setForm] = useState({ medication:'', dose:'', route:'Oral', frequency:'Once daily', duration:'', quantity:'', refills:'0', instructions:'' })
  const submit = (event) => {
    event.preventDefault()
    onPrescribe({ id:`RX-${Date.now()}`, patientId:patient.id, patientName:patient.name, medication:form.medication.trim(), dose:form.dose.trim(), route:form.route, frequency:form.frequency, duration:form.duration.trim(), quantity:form.quantity.trim(), refills:form.refills, instructions:form.instructions.trim(), prescribedBy:'Dr. Alex Morgan', prescribedAt:new Date().toISOString(), status:'Prescribed', administeredAt:'', administeredBy:'', signedAt:'', signedBy:'' })
    setForm({ medication:'', dose:'', route:'Oral', frequency:'Once daily', duration:'', quantity:'', refills:'0', instructions:'' })
  }
  const update = (key,value) => setForm((current)=>({...current,[key]:value}))
  return <section className="panel medication-workspace-panel"><PanelHeader title="Prescribe medication" subtitle={`New prescription for ${patient.name} · ${patient.id}`}/><form className="prescription-form" onSubmit={submit}><div className="prescription-safety"><b>Patient safety check</b><span>Allergies on record: <strong>{patient.allergies || 'Not recorded'}</strong></span><span>Current medication: <strong>{patient.medication || 'None recorded'}</strong></span></div><div className="prescription-grid"><label className="prescription-wide">Medication<input required value={form.medication} onChange={e=>update('medication',e.target.value)} placeholder="Drug name and formulation"/></label><label>Dose<input required value={form.dose} onChange={e=>update('dose',e.target.value)} placeholder="e.g. 500 mg"/></label><label>Route<select value={form.route} onChange={e=>update('route',e.target.value)}><option>Oral</option><option>IV</option><option>IM</option><option>Subcutaneous</option><option>Inhaled</option><option>Topical</option><option>Other</option></select></label><label>Frequency<select value={form.frequency} onChange={e=>update('frequency',e.target.value)}><option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>Every 4 hours</option><option>Every 6 hours</option><option>As needed</option><option>Once</option></select></label><label>Duration<input value={form.duration} onChange={e=>update('duration',e.target.value)} placeholder="e.g. 7 days"/></label><label>Quantity<input required type="number" min="1" value={form.quantity} onChange={e=>update('quantity',e.target.value)} placeholder="Units"/></label><label>Refills<select value={form.refills} onChange={e=>update('refills',e.target.value)}><option>0</option><option>1</option><option>2</option><option>3</option></select></label><label className="prescription-wide">Instructions<textarea value={form.instructions} onChange={e=>update('instructions',e.target.value)} placeholder="Patient directions and prescribing notes"/></label></div><div className="prescription-actions"><span>Submitting sends this prescription to the Pharmacy queue.</span><Button kind="primary" type="submit">Prescribe and notify pharmacy →</Button></div></form></section>
}

function DrugChart({ patient, staffRole, orders, onAction, onUpdateOrder }) {
  const [givingOrderId,setGivingOrderId] = useState('')
  const [signatureOrderId,setSignatureOrderId] = useState('')
  const [givenAt,setGivenAt] = useState(new Date().toISOString().slice(0,16))
  const [administrationNote,setAdministrationNote] = useState('')
  const [nursePassword,setNursePassword] = useState('')
  const [signatureError,setSignatureError] = useState('')
  const patientOrders = orders.filter((order)=>order.patientId===patient.id)
  const confirmGiven = (event,order) => {
    event.preventDefault()
    onUpdateOrder(order.id,{status:'Given · awaiting nurse signature',administeredAt:new Date(givenAt).toISOString(),administeredBy:'Nurse',administrationNote})
    setGivingOrderId('')
    setAdministrationNote('')
    setSignatureOrderId(order.id)
    onAction(`${order.medication} recorded as given · nurse signature required`)
  }
  const signAdministration = (event,order) => {
    event.preventDefault()
    const nurseAccount=demoAccounts.find((account)=>account.role==='Nurse')
    if(!nurseAccount||nursePassword!==nurseAccount.password){setSignatureError('Password did not match the Nurse account.');return}
    onUpdateOrder(order.id,{status:'Administered',signedAt:new Date().toISOString(),signedBy:'Nurse'})
    setSignatureOrderId('')
    setNursePassword('')
    setSignatureError('')
    onAction(`${order.medication} administration signed by Nurse`)
  }
  return <section className="panel medication-workspace-panel"><PanelHeader title="Drug chart" subtitle={`Prescriptions and administration record · ${patient.name}`}/><div className="drug-chart-patient"><span><small>PATIENT</small><b>{patient.name} · {patient.id}</b></span><span><small>ALLERGIES</small><b>{patient.allergies || 'Not recorded'}</b></span></div>{patientOrders.length?patientOrders.map((order)=><article className="drug-order" key={order.id}><div className="drug-order-top"><span className="drug-order-icon">＋</span><span className="drug-order-name"><b>{order.medication} <i>{order.dose}</i></b><small>{order.route} · {order.frequency}{order.duration?` · ${order.duration}`:''} · Qty {order.quantity}</small></span><span className={`drug-order-status ${order.status==='Administered'?'drug-given':order.status.startsWith('Given')?'drug-awaiting-sign':'drug-prescribed'}`}>{order.status}</span></div><div className="drug-order-detail"><span>Prescribed by <b>{order.prescribedBy}</b></span><span>{new Date(order.prescribedAt).toLocaleString()}</span>{order.instructions&&<p>{order.instructions}</p>}{order.administrationNote&&<p>Administration note: {order.administrationNote}</p>}{order.administeredAt&&<span>Given {new Date(order.administeredAt).toLocaleString()} · {order.administeredBy}</span>}{order.signedAt&&<span className="signed-record">Signed by {order.signedBy} · {new Date(order.signedAt).toLocaleString()}</span>}</div>
      {staffRole==='Nurse'&&order.status==='Prescribed'&&<div className="drug-order-actions"><Button kind="primary" onClick={()=>{setGivingOrderId(order.id);setGivenAt(new Date().toISOString().slice(0,16))}}>Record medication given</Button></div>}
      {staffRole==='Nurse'&&order.status.startsWith('Given')&&<div className="nurse-signature-section"><b>Medication marked given · Signature pending</b>{signatureOrderId===order.id?<form className="nurse-signature-form" onSubmit={(event)=>signAdministration(event,order)}><label>Nurse password<input type="password" autoComplete="current-password" value={nursePassword} onChange={e=>{setNursePassword(e.target.value);setSignatureError('')}} required/></label>{signatureError&&<small role="alert">{signatureError}</small>}<Button kind="primary" type="submit">Sign administration</Button></form>:<Button kind="primary" onClick={()=>{setSignatureOrderId(order.id);setSignatureError('')}}>Sign with nurse password</Button>}</div>}
      {givingOrderId===order.id&&staffRole==='Nurse'&&<form className="nurse-giving-form" onSubmit={(event)=>confirmGiven(event,order)}><div><label>Date and time given<input type="datetime-local" value={givenAt} onChange={e=>setGivenAt(e.target.value)} required/></label><label>Administration note<textarea value={administrationNote} onChange={e=>setAdministrationNote(e.target.value)} placeholder="Optional note about the administration"/></label></div><div><Button type="button" onClick={()=>setGivingOrderId('')}>Cancel</Button><Button kind="primary" type="submit">Confirm given</Button></div></form>}
    </article>):<div className="drug-chart-empty"><span>＋</span><b>No prescriptions on this drug chart yet</b><p>Once a doctor prescribes a medication, it will appear here and in the Pharmacy queue.</p></div>}</section>
}

export { MedicationWorkspace }
