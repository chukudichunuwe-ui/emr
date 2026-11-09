import { useState } from 'react'
import { PageHeading } from '../components/ui.jsx'
import { MedicationWorkspace } from '../components/MedicationWorkspace.jsx'

function MedicationsPage({ staffRole, patients = [], medicationOrders = [], onPrescribe, onUpdateMedicationOrder, notify, mode = '' }) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '')
  const patient = patients.find((item) => item.id === selectedPatientId) || patients[0]
  const view = staffRole === 'Nurse' ? 'drug-chart' : mode === 'prescribe' ? 'prescribe' : 'drug-chart'
  return <><PageHeading eyebrow="MEDICATION WORKSPACE" title={view === 'prescribe' ? 'Prescribe medication' : 'Drug chart'} description={view === 'prescribe' ? 'Create a prescription and send it to the pharmacy queue.' : 'Review prescriptions and record medication administration.'}/>
    {patients.length > 0 && <div className="medication-patient-picker"><label htmlFor="medication-patient">Patient</label><select id="medication-patient" value={patient?.id || ''} onChange={(event) => setSelectedPatientId(event.target.value)}>{patients.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.id}</option>)}</select></div>}
    {patient ? <MedicationWorkspace patient={patient} staffRole={staffRole} view={view} orders={medicationOrders.filter((order) => order.patientId === patient.id)} onPrescribe={onPrescribe} onUpdateOrder={onUpdateMedicationOrder} onAction={notify}/> : <section className="panel medication-workspace-panel">No patients are available.</section>}
  </>
}

export { MedicationsPage }
