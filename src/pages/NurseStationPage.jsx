import { useState } from 'react'
import { Avatar, Button, Metric, PageHeading, PanelHeader } from '../components/ui.jsx'

const departments = ['Inpatient', 'Outpatient', 'Emergency']

function patientDepartment(patient) {
  return patient.route || patient.careSetting || 'Outpatient'
}

function NurseStationPage({ patients, setPage, openPatient }) {
  const [department, setDepartment] = useState('Inpatient')
  const departmentPatients = patients.filter((patient) => patientDepartment(patient) === department)

  return <>
    <PageHeading eyebrow="NURSING WORKSPACE · DAY SHIFT" title="Nurse station" description="Review patients in the department you are working." action={<Button kind="primary" onClick={() => setPage('Initial assessment')}>＋ Start assessment</Button>} />
    <div className="metric-grid">
      <Metric label={`${department} patients`} value={departmentPatients.length} change="Current list" note="Assigned to your department" icon="♧" tone="lavender" />
      <Metric label="Observations due" value="04" change="2 overdue" note="Next due 10:30 AM" icon="⌁" tone="peach" />
      <Metric label="Medication rounds" value="08" change="Next round" note="11:00 AM" icon="＋" tone="mint" />
      <Metric label="Handover tasks" value="03" change="1 priority" note="Open items" icon="⇄" tone="sky" />
    </div>
    <section className="panel nurse-panel">
      <PanelHeader title={`${department} patients`} subtitle="Patient intake and assigned care · Updated just now" action={<button className="text-link" onClick={() => setPage('Nurses report')}>Open shift report →</button>} />
      <div className="nurse-departments" aria-label="Nursing department">
        {departments.map((area) => {
          const count = patients.filter((patient) => patientDepartment(patient) === area).length
          return <button type="button" key={area} className={`nurse-department ${department === area ? 'active' : ''}`} aria-pressed={department === area} onClick={() => setDepartment(area)}><span>{area}</span><b>{count}</b></button>
        })}
      </div>
      <div className="nurse-patient-list">
        {departmentPatients.map((patient, index) => <div className="nurse-patient" key={patient.id}>
          <Avatar name={patient.name} color={patient.color} />
          <div><b>{patient.name}</b><small>{patient.id} · {patient.condition || 'Patient record'} · {patient.status}</small></div>
          <span className={`nurse-priority ${department === 'Emergency' || index === 0 ? 'priority-high' : ''}`}>{department === 'Emergency' ? 'Triage review' : index === 0 ? 'Review due' : 'Routine'}</span>
          <button className="button secondary" onClick={() => openPatient(patient)}>Open chart</button>
        </div>)}
        {departmentPatients.length === 0 && <p className="nurse-empty">No patients are currently assigned to this department.</p>}
      </div>
    </section>
  </>
}

export { NurseStationPage }
