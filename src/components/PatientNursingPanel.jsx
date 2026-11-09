import { useMemo, useState } from 'react'
import { Button, PanelHeader } from './ui.jsx'

const outpatientWorkflows = ['Vital signs', 'Initial assessment']
const inpatientWorkflows = ['ISBAR handover', 'Vital signs', 'Initial assessment', 'Fluid chart', 'Turning chart', 'Care plan', 'Nurse report', 'Medication administration']

const fieldsByWorkflow = {
  'Vital signs': [['Blood pressure', 'text', 'e.g. 120/80 mmHg'], ['Heart rate', 'number', 'bpm'], ['Respiratory rate', 'number', 'breaths/min'], ['Temperature', 'number', '°C'], ['Oxygen saturation', 'number', '%'], ['Pain score', 'number', '0–10'], ['Observation notes', 'textarea', 'Symptoms, actions, and response']],
  'Initial assessment': [['Arrival mode', 'select', 'Walk-in|Ambulance|Transfer'], ['Consciousness', 'select', 'Alert|Voice responsive|Pain responsive|Unresponsive'], ['Mobility', 'select', 'Independent|Needs assistance|Wheelchair|Bedbound'], ['Fall risk', 'select', 'Low|Moderate|High'], ['Presenting concern', 'textarea', 'Patient’s reason for attendance'], ['Initial findings', 'textarea', 'Document assessment findings and immediate needs']],
  'ISBAR handover': [['Identify', 'text', 'Patient, identifiers, and location'], ['Situation', 'textarea', 'Reason for handover and current concern'], ['Background', 'textarea', 'Relevant history, allergies, and treatment'], ['Assessment', 'textarea', 'Observations, clinical impression, and response'], ['Recommendation', 'textarea', 'Actions, escalation, and review time']],
  'Fluid chart': [['Time', 'time', ''], ['Intake type', 'text', 'Oral, IV, or enteral'], ['Intake amount', 'number', 'mL'], ['Output type', 'text', 'Urine, drain, emesis, or other'], ['Output amount', 'number', 'mL'], ['Fluid notes', 'textarea', 'Tolerance, appearance, or other notes']],
  'Turning chart': [['Time', 'time', ''], ['Position', 'select', 'Left side|Right side|Supine|Prone|Chair'], ['Skin check', 'textarea', 'Skin condition and pressure areas'], ['Comfort / support', 'text', 'Pillows, device, or support used'], ['Completed by', 'text', 'Nurse name or initials']],
  'Care plan': [['Nursing problem', 'text', 'Problem or nursing diagnosis'], ['Patient goal', 'textarea', 'Desired outcome and timeframe'], ['Interventions', 'textarea', 'Planned nursing actions'], ['Evaluation', 'textarea', 'Response and next review'], ['Review date', 'date', '']],
  'Nurse report': [['Shift', 'select', 'Day|Evening|Night'], ['Patient status and events', 'textarea', 'Changes, interventions, response, and escalation'], ['Outstanding tasks', 'textarea', 'Follow-up for the next shift'], ['Safety and environment', 'textarea', 'Lines, wounds, falls precautions, and equipment']],
  'Medication administration': [['Medication', 'text', 'Name and strength'], ['Dose', 'text', 'Dose'], ['Route', 'select', 'Oral|IV|IM|Subcutaneous|Inhaled|Topical'], ['Scheduled time', 'time', ''], ['Administration status', 'select', 'Given|Withheld|Refused|Not available'], ['Reason / response', 'textarea', 'Omission reason and patient response']],
}

function PatientNursingPanel({ patient, onSave }) {
  const [workflow, setWorkflow] = useState('Vital signs')
  const [values, setValues] = useState({})
  const [savedMessage, setSavedMessage] = useState('')
  const department = patient.route || patient.careSetting || 'Inpatient'
  const workflows = department === 'Outpatient' ? outpatientWorkflows : inpatientWorkflows
  const fields = useMemo(() => fieldsByWorkflow[workflow] || [], [workflow])

  const save = (event) => {
    event.preventDefault()
    onSave(`${workflow} saved for ${patient.name}`)
    setSavedMessage('Saved just now')
  }

  return <section className="panel patient-nursing-panel">
    <PanelHeader title="Nursing care" subtitle={`${department} · Documentation for ${patient.name}`} />
    <div className="patient-nursing-workflows" role="tablist" aria-label="Nursing workflows">
      {workflows.map((item) => <button key={item} type="button" role="tab" aria-selected={workflow === item} className={workflow === item ? 'selected' : ''} onClick={() => { setWorkflow(item); setSavedMessage('') }}>{item}</button>)}
    </div>
    <form className="patient-nursing-form" onSubmit={save}>
      <div className="patient-nursing-fields">
        {fields.map(([label, type, placeholder]) => <label className={type === 'textarea' ? 'nursing-field-wide' : ''} key={label}>{label}{type === 'textarea' ? <textarea required placeholder={placeholder} value={values[`${workflow}:${label}`] || ''} onChange={(event) => setValues({ ...values, [`${workflow}:${label}`]: event.target.value })} /> : type === 'select' ? <select required value={values[`${workflow}:${label}`] || ''} onChange={(event) => setValues({ ...values, [`${workflow}:${label}`]: event.target.value })}><option value="" disabled>Select</option>{placeholder.split('|').map((option) => <option key={option}>{option}</option>)}</select> : <input required type={type} placeholder={placeholder} value={values[`${workflow}:${label}`] || ''} onChange={(event) => setValues({ ...values, [`${workflow}:${label}`]: event.target.value })} />}</label>)}
      </div>
      <div className="patient-nursing-actions"><span aria-live="polite">{savedMessage}</span><Button kind="primary" type="submit">Save {workflow.toLowerCase()}</Button></div>
    </form>
  </section>
}

export { PatientNursingPanel }
