import { useEffect, useState } from 'react'
import { Avatar, Button, Detail, PanelHeader, StatusTag } from './ui.jsx'
import { PatientNursingPanel } from './PatientNursingPanel.jsx'
import { initialDoctorNotes, postedResults } from '../data/demoData.js'
import { MedicationWorkspace } from './MedicationWorkspace.jsx'
import { readNursingRecords } from '../data/nursingRecords.js'

const observationHistory = [
  { time:'10:00 AM', bloodPressure:'128/78', pulse:'76', respiratory:'16', temperature:'36.8 °C', oxygen:'98%', pain:'0' },
  { time:'08:00 AM', bloodPressure:'132/82', pulse:'81', respiratory:'18', temperature:'36.7 °C', oxygen:'97%', pain:'1' },
  { time:'06:00 AM', bloodPressure:'126/80', pulse:'74', respiratory:'16', temperature:'36.6 °C', oxygen:'98%', pain:'0' },
]

function vitalTone(kind, value) {
  const numbers = String(value).match(/[\d.]+/g)?.map(Number) || []
  const ranges = { pulse: [60, 100], respiratory: [12, 20], temperature: [36.1, 37.2], oxygen: [95, 100], pain: [0, 3] }
  if (kind === 'bloodPressure') return numbers.length < 2 ? 'neutral' : numbers[0] < 90 || numbers[0] > 139 || numbers[1] < 60 || numbers[1] > 89 ? 'abnormal' : 'normal'
  const range = ranges[kind]
  if (!range || numbers.length !== 1) return 'neutral'
  return numbers[0] < range[0] || numbers[0] > range[1] ? 'abnormal' : 'normal'
}

function investigationTone(value) {
  const text = String(value).toLowerCase()
  if (/within (reference )?range|within range|no acute|unremarkable|negative for|no evidence of/.test(text)) return 'normal'
  if (/above target|below target|below reference range|above reference range|out of range|abnormal|elevated|detected|concerning for|compatible with|\b(low|high|positive|critical)\b|flagged/.test(text)) return 'abnormal'
  return 'neutral'
}

function ProfessionalPatientChart({ patient, staffRole, tab, setTab, onBack, onAction, medicationOrders = [], doctorNotes = [], onSaveDoctorNote, onPrescribe, onUpdateMedicationOrder }) {
  const [noteSavedForPatient, setNoteSavedForPatient] = useState('')
  const [nursingRecords, setNursingRecords] = useState(readNursingRecords)
  useEffect(() => { const refresh = () => setNursingRecords(readNursingRecords()); window.addEventListener('emr-nursing-records-updated', refresh); return () => window.removeEventListener('emr-nursing-records-updated', refresh) }, [])
  const [medicationView, setMedicationView] = useState(staffRole === 'Nurse' ? 'drug-chart' : 'overview')
  const tabs = ['Overview','Doctors note','Medications','Vitals signs chart','Investigations','Nurses station']
  const patientResults = postedResults.filter((item) => item.patient === patient.name)
  const patientOrders = medicationOrders.filter((order) => order.patientId === patient.id)
  const savedPatientNotes = [...initialDoctorNotes, ...doctorNotes]
    .filter((note) => note.patientId === patient.id || note.patientName?.trim().toLowerCase() === patient.name.trim().toLowerCase())
    .filter((note, index, notes) => notes.findIndex((candidate) => candidate.id === note.id) === index)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const previousNote = !savedPatientNotes.length && patient.note ? { id: `previous-${patient.id}`, patientName: patient.name, encounterType: 'Previous visit', subjective: 'Previous patient record summary', objective: '', assessment: patient.condition || 'Clinical review', plan: patient.note, author: 'Dr. Alex Morgan', createdAt: patient.lastVisit, legacy: true } : null
  const noteHistory = [...savedPatientNotes, ...(previousNote ? [previousNote] : [])]
  const saveNote = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSaveDoctorNote?.({ id: `NOTE-${Date.now()}`, patientId: patient.id, patientName: patient.name, encounterType: form.get('encounterType'), subjective: form.get('subjective').trim(), objective: form.get('objective').trim(), assessment: form.get('assessment').trim(), plan: form.get('plan').trim(), author: 'Dr. Alex Morgan', createdAt: new Date().toISOString() })
    setNoteSavedForPatient(patient.id)
    event.currentTarget.reset()
  }
  return <><div className="chart-back"><button onClick={onBack}>← <span>Back to patients</span></button><span>Patient record <i>/</i> {patient.id}</span><div><Button onClick={()=>onAction('Patient summary ready to print')}>↓ Print</Button>{staffRole==='Doctor'&&<Button kind="primary" onClick={()=>setTab('Doctors note')}>＋ New doctor’s note</Button>}</div></div>
    <section className="panel patient-banner"><Avatar name={patient.name} color={patient.color} size="large"/><div className="patient-banner-info"><div className="patient-name-line"><h1>{patient.name}</h1><span className="id-tag">{patient.id}</span><StatusTag status={patient.status}/></div><p>{patient.age} years <i>·</i> {patient.sex} <i>·</i> DOB {patient.dob || 'Not recorded'}</p><div className="patient-contacts"><span>♧ {patient.phone || 'Phone not recorded'}</span><span>✉ {patient.email || 'Email not recorded'}</span><span>⌖ {patient.address}</span></div></div></section>
    <div className="chart-tabs professional-chart-tabs" role="tablist" aria-label="Professional patient chart">{tabs.map((item)=>item==='Medications'?<div className="medication-tab-menu" key={item}><button type="button" role="tab" aria-selected={tab===item} className={tab===item?'selected':''} onClick={()=>{setTab(item);setMedicationView(staffRole==='Nurse'?'drug-chart':'overview')}}>{item}</button><div className="medication-tab-popover" role="menu">{staffRole==='Doctor'&&<button type="button" role="menuitem" onClick={()=>{setTab('Medications');setMedicationView('prescribe')}}>Prescribe</button>}<button type="button" role="menuitem" onClick={()=>{setTab('Medications');setMedicationView('drug-chart')}}>Drug chart</button></div></div>:<button type="button" role="tab" aria-selected={tab===item} className={tab===item?'selected':''} onClick={()=>setTab(item)} key={item}>{item}</button>)}</div>
    {tab==='Overview'&&<div className="professional-overview-grid"><section className="panel professional-chart-panel"><PanelHeader title="Clinical summary" subtitle="Relevant information for the current episode"/><div className="professional-summary-block"><span className="summary-icon rose">♡</span><div><small>PRIMARY CONDITION</small><b>{patient.condition || 'No active condition recorded'}</b><p>{patient.note || 'No recent clinical note is available.'}</p></div></div><div className="professional-summary-block"><span className="summary-icon peach">⚠</span><div><small>ALLERGIES</small><b>{patient.allergies || 'Not recorded'}</b><p>Verify allergies during each care transition.</p></div></div><div className="professional-summary-block"><span className="summary-icon lavender">✚</span><div><small>ACTIVE MEDICATION</small><b>{patient.medication || 'None recorded'}</b><p>Review and reconcile with the patient.</p></div></div></section><section className="panel professional-chart-panel"><PanelHeader title="Patient context" subtitle="Demographic and care details"/><Detail label="Care category" value={careCategory(patient)}/><Detail label="Date of birth" value={patient.dob || 'Not recorded'}/><Detail label="Blood group" value={patient.blood || 'Not recorded'}/><Detail label="Last visit" value={patient.lastVisit || 'Not recorded'}/><Detail label="Care team" value="Dr. Alex Morgan · Primary care"/></section></div>}
    {tab==='Doctors note'&&<section className={`panel doctor-notes-mini-page ${staffRole==='Nurse'?'nurse-readonly-notes':''}`}><div className="doctor-notes-page-heading"><div><span className="eyebrow">PATIENT RECORD / CLINICAL NOTES</span><h2>Doctor’s notes</h2><p>{patient.name} · {patient.id} {staffRole==='Nurse'?'· Read only':''}</p></div></div>{staffRole==='Doctor'&&<form className="doctor-note-form doctor-note-editor" onSubmit={saveNote}><label>Encounter type<select name="encounterType" defaultValue="Follow-up visit"><option>Follow-up visit</option><option>New patient consultation</option><option>Annual physical</option><option>Urgent review</option></select></label><label>Subjective<textarea name="subjective" required placeholder="Patient’s account, symptoms, and concerns…"/></label><label>Objective<textarea name="objective" required placeholder="Examination findings, observations, and investigation results…"/></label><label>Assessment<textarea name="assessment" required placeholder="Clinical assessment and working diagnosis…"/></label><label>Plan<textarea name="plan" required placeholder="Treatment, advice, referrals, and follow-up…"/></label><div className="doctor-note-actions"><span aria-live="polite">{noteSavedForPatient===patient.id?'Note saved':'New note'}</span><Button kind="primary" type="submit">Save doctor’s note</Button></div></form>}<div className="doctor-note-history"><div className="doctor-note-history-heading"><h3>Previous doctor’s notes</h3><span>{noteHistory.length} {noteHistory.length===1?'note':'notes'}</span></div>{noteHistory.length?noteHistory.map((note)=><article className="doctor-note-record" key={note.id}><div className="doctor-note-record-header"><span><b>{note.encounterType || 'Clinical note'}</b><small>{note.author || 'Doctor'}{note.legacy?' · Previous record':''}</small></span><time>{note.legacy?(note.createdAt || 'Date not recorded'):new Date(note.createdAt).toLocaleString()}</time></div>{[['Subjective',note.subjective],['Objective',note.objective],['Assessment',note.assessment],['Plan',note.plan]].filter(([,value])=>value).map(([label,value])=><div className="doctor-note-record-field" key={label}><b>{label}</b><p>{value}</p></div>)}</article>):<div className="doctor-notes-empty">No doctor’s notes have been recorded for this patient yet.</div>}</div></section>}
    {tab==='Medications'&&(medicationView==='overview'?<MedicationReview patient={patient} onAction={onAction}/>:<MedicationWorkspace patient={patient} staffRole={staffRole} view={medicationView} orders={patientOrders} onAction={onAction} onPrescribe={onPrescribe} onUpdateOrder={onUpdateMedicationOrder}/>)}
    {tab==='Vitals signs chart'&&<section className="panel professional-chart-panel vitals-chart-panel"><PanelHeader title="Vital signs chart" subtitle={`Recent observations · ${patient.name}`} action={<Button onClick={()=>onAction('Observation entry opened')}>＋ Add observation</Button>}/><div className="vitals-summary-row">{[['Blood pressure','128/78','mmHg','bloodPressure'],['Heart rate','76','bpm','pulse'],['Temperature','36.8','°C','temperature'],['Oxygen saturation','98','%','oxygen']].map(([label,value,unit,kind])=><div key={label}><small>{label}</small><b className={`clinical-value-${vitalTone(kind,value)}`}>{value}<i>{unit}</i></b><span>Last recorded · 10:00 AM</span></div>)}</div><div className="vitals-table-wrap"><div className="vitals-table"><div><b>TIME</b><b>BP (mmHg)</b><b>HEART RATE</b><b>RESP. RATE</b><b>TEMPERATURE</b><b>SpO₂</b><b>PAIN</b></div>{observationHistory.map((item)=><div key={item.time}><span>{item.time}</span><span className={`clinical-value-${vitalTone('bloodPressure',item.bloodPressure)}`}>{item.bloodPressure}</span><span className={`clinical-value-${vitalTone('pulse',item.pulse)}`}>{item.pulse} bpm</span><span className={`clinical-value-${vitalTone('respiratory',item.respiratory)}`}>{item.respiratory}/min</span><span className={`clinical-value-${vitalTone('temperature',item.temperature)}`}>{item.temperature}</span><span className={`clinical-value-${vitalTone('oxygen',item.oxygen)}`}>{item.oxygen}</span><span className={`clinical-value-${vitalTone('pain',item.pain)}`}>{item.pain}/10</span></div>)}</div></div><p className="vitals-demo-note">Blue values are within reference ranges; red values need clinical review. Sample observation values for interface preview.</p></section>}
    {tab==='Investigations'&&<section className="panel professional-chart-panel investigations-panel"><PanelHeader title="Investigations" subtitle={`Laboratory and imaging results for ${patient.name}`}/>{patientResults.length?patientResults.map((result)=>{const tone=investigationTone(result.result);return <div className="investigation-row" key={`${result.type}-${result.title}`}><span className={`result-type ${result.type.toLowerCase()}`}>{result.type}</span><span><b>{result.title}</b><small>{result.date}</small></span><p className={`clinical-result-${tone}`}>{result.result}</p><StatusTag status="Completed"/></div>}):<div className="professional-empty"><span>⌁</span><b>No investigations posted</b><p>Results will appear here when they are released to the patient record.</p></div>}</section>}
    {tab==='Nurses station'&&<div className="professional-nurses-layout">{staffRole==='Nurse'?<><div className="nurse-station-heading"><div><span className="eyebrow">NURSING WORKSPACE</span><h2>Bedside documentation</h2><p>Record nursing observations and care for {patient.name}.</p></div><span className="nurse-patient-category">{careCategory(patient)}</span></div><PatientNursingPanel patient={patient} onSave={onAction}/></>:<NursingRecordsView patient={patient} records={nursingRecords.filter(record=>record.patientId===patient.id)}/>}</div>}
  </>
}

function MedicationReview({ patient, onAction }) {
  return <div className="professional-overview-grid"><section className="panel professional-chart-panel medication-review-panel"><PanelHeader title="Current medications" subtitle={`Medication record for ${patient.name}`} action={<Button kind="primary" onClick={()=>onAction('Medication review opened')}>Review medications</Button>}/><div className="medication-review-card"><span className="medication-review-icon">＋</span><span><small>ACTIVE MEDICATION</small><b>{patient.medication || 'No active medication recorded'}</b><i>Patient record · Reconciliation required</i></span><span className="medication-record-status">On file</span></div><Detail label="Last reconciliation" value="Not recorded"/><Detail label="Medication allergies" value={patient.allergies || 'Not recorded'}/><p className="medication-review-note">Confirm the medication list with the patient and document any changes in the encounter plan.</p></section><section className="panel professional-chart-panel"><PanelHeader title="Medication safety" subtitle="Review before prescribing or administering"/><Detail label="Patient identity" value={`${patient.name} · ${patient.id}`}/><Detail label="Allergies" value={patient.allergies || 'Not recorded'}/><Detail label="Current list" value={patient.medication || 'None recorded'}/><div className="medication-safety-note"><b>Reconciliation check</b><p>Verify dose, route, frequency, recent changes, and patient reported use with the current chart.</p></div></section></div>
}

function careCategory(patient) {
  const value = (patient.route || patient.careSetting || 'Outpatient').toLowerCase().replace(/[^a-z]/g,'')
  return value==='inpatient'?'In-patient':value==='outpatient'?'Out-patient':'Emergency'
}

function NursingRecordsView({ patient, records }) {
  const types = ['Fluid balance','Nurses report','Vital signs','Initial assessment','ISBAR handover','Care plans','Medication administration']
  return <><section className="panel professional-chart-panel"><PanelHeader title="Nursing documentation" subtitle={`All recorded nursing entries · ${patient.name}`} action={<span className="nurse-patient-category">{careCategory(patient)}</span>}/><div className="nursing-record-mini-grid">{types.map(type=>{const rows=records.filter(record=>record.type===type);const latest=rows[0];return <NursingRecordMini key={type} type={type} records={rows} latest={latest}/>})}</div>{!records.length&&<p className="nursing-record-empty">No saved nursing documentation is available yet.</p>}</section></>
}

function NursingRecordMini({ type, records, latest }) {
  const [expanded,setExpanded]=useState(false)
  return <article className="nursing-record-mini"><div className="nursing-record-mini-head"><span><small>{type.toUpperCase()}</small><b>{latest?`${records.length} saved entr${records.length===1?'y':'ies'}`:'No entries yet'}</b></span><time>{latest?`${latest.date||'Date not recorded'} · ${latest.time||''}`:'—'}</time></div>{latest&&<p>{Object.entries(latest.values||{}).filter(([,value])=>value).slice(0,2).map(([key,value])=>`${key}: ${value}`).join(' · ')||latest.nurse}</p>}<button className="button secondary nursing-record-expand" type="button" onClick={()=>setExpanded(!expanded)}>{expanded?'Collapse':'Expand'} {type.toLowerCase()} ↓</button>{expanded&&<div className="nursing-record-sheet">{records.length?records.map(record=><div className="nursing-record-entry" key={record.id}><div className="nursing-record-entry-head"><b>{record.date||'Date not recorded'} · {record.time||'Time not recorded'}</b><span>{record.nurse||'Nursing staff'}</span></div><table><tbody>{Object.entries(record.values||{}).filter(([,value])=>value).map(([label,value])=><tr key={label}><th>{label}</th><td className={`clinical-value-${nursingTone(label,value)}`}>{value}</td></tr>)}</tbody></table></div>):<p>No records for this section.</p>}</div>}</article>
}

function nursingTone(label,value) {
  const key=label.toLowerCase(), text=String(value).toLowerCase(), numbers=text.match(/[\d.]+/g)?.map(Number)||[]
  if(/high|critical|severe|unresponsive|abnormal|positive|escalate|urgent|wound present|not given|withheld|refused/.test(text)) return 'abnormal'
  if(key.includes('early warning score')&&numbers.some((number)=>number>0)) return 'abnormal'
  if(key.includes('blood pressure')&&numbers.length>=2) return numbers[0]<90||numbers[0]>139||numbers[1]<60||numbers[1]>89?'abnormal':'normal'
  const range=key.includes('heart rate')?[60,100]:key.includes('respiratory rate')?[12,20]:key.includes('temperature')?[36.1,37.2]:key.includes('oxygen')?[95,100]:key.includes('pain')?[0,3]:null
  if(range&&numbers.length) return numbers[0]<range[0]||numbers[0]>range[1]?'abnormal':'normal'
  if(/normal|intact|independent|alert|low risk|no concern|no$|stable|within range|negative/.test(text)) return 'normal'
  return 'neutral'
}

export { ProfessionalPatientChart }
