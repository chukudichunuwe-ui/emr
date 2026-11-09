import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import { initialPatients, initialDoctorNotes, navSections } from './data/demoData.js'
import { Avatar, Icon } from './components/ui.jsx'
import { StaffLogin } from './pages/LoginPage.jsx'
import { NursingPage } from './pages/NursingPage.jsx'
import { NurseStationPage } from './pages/NurseStationPage.jsx'
import { ReceptionPage } from './pages/ReceptionPage.jsx'
import { RoleDashboardPage } from './pages/RoleDashboardPage.jsx'
import { PatientsPage, PatientChart } from './pages/PatientsPage.jsx'
import { SchedulePage } from './pages/SchedulePage.jsx'
import { EncountersPage } from './pages/EncountersPage.jsx'
import { InboxPage } from './pages/InboxPage.jsx'
import { LabsPage } from './pages/LabResultsPage.jsx'
import { MedicationsPage } from './pages/MedicationsPage.jsx'
import { DocumentsPage } from './pages/DocumentsPage.jsx'
import { BillingPage } from './pages/BillingPage.jsx'
import { ReportsPage } from './pages/ReportsPage.jsx'
import { SpecialtyPage } from './pages/SpecialtyPage.jsx'
import { InventoryPage } from './pages/InventoryPage.jsx'

const routeFor = {
  Dashboard: '/dashboard', 'Front desk / Reception': '/reception', Patients: '/patients', Schedule: '/schedule',
  Encounters: '/encounters', Inbox: '/inbox', 'Lab results': '/lab-results', Medications: '/medications',
  Documents: '/documents', Billing: '/billing', Reports: '/reports',
  'Nurse station': '/nursing/nurse-station', 'Initial assessment': '/nursing/initial-assessment',
  'ISBAR handover': '/nursing/isbar-handover', 'Vital signs': '/nursing/vital-signs',
  'Fluid balance': '/nursing/fluid-balance', 'Nurses report': '/nursing/nurses-report',
  'Care plans': '/nursing/care-plans', 'Medication administration': '/nursing/medication-administration',
  Consultations: '/services/consultations', 'Doctors notes': '/services/doctors-notes', Laboratory: '/services/laboratory', Inventory: '/services/inventory',
  Pharmacy: '/services/pharmacy', Physiotherapy: '/services/physiotherapy', Radiology: '/services/radiology',
}

function normalizeCareCategory(value = '') {
  return value.toLowerCase().replace(/[^a-z]/g, '')
}

function matchesCareCategory(patient, selectedCategory) {
  if (selectedCategory === 'All patients') return true
  const patientCategory = patient.route || patient.careSetting || 'Outpatient'
  return normalizeCareCategory(patientCategory) === normalizeCareCategory(selectedCategory)
}

const PATIENT_STORAGE_KEY = 'careflow_registered_patients_v1'
const MEDICATION_ORDER_STORAGE_KEY = 'careflow_medication_orders_v1'
const DOCTOR_NOTE_STORAGE_KEY = 'careflow_doctor_notes_v1'

function readPatientRecords() {
  try {
    const saved = window.localStorage.getItem(PATIENT_STORAGE_KEY)
    if (!saved) return initialPatients
    const records = JSON.parse(saved)
    return Array.isArray(records) ? [...records, ...initialPatients.filter((seed) => !records.some((record) => record.id === seed.id || record.name?.trim().toLowerCase() === seed.name.toLowerCase()))] : initialPatients
  } catch {
    return initialPatients
  }
}

function readMedicationOrders() {
  try {
    const saved = window.localStorage.getItem(MEDICATION_ORDER_STORAGE_KEY)
    const orders = saved ? JSON.parse(saved) : []
    return Array.isArray(orders) ? orders : []
  } catch {
    return []
  }
}

function readDoctorNotes() {
  try {
    const saved = window.localStorage.getItem(DOCTOR_NOTE_STORAGE_KEY)
    const notes = saved ? JSON.parse(saved) : []
    return Array.isArray(notes) ? [...initialDoctorNotes.filter((seed) => !notes.some((note) => note.id === seed.id)), ...notes] : initialDoctorNotes
  } catch { return [] }
}

function App() {
  return <BrowserRouter><Workspace /></BrowserRouter>
}

function Workspace() {
  const navigate = useNavigate()
  const location = useLocation()
  const [signedIn, setSignedIn] = useState(false)
  const [staffRole, setStaffRole] = useState('')
  const [patients, setPatients] = useState(readPatientRecords)
  const [medicationOrders, setMedicationOrders] = useState(readMedicationOrders)
  const [doctorNotes, setDoctorNotes] = useState(readDoctorNotes)
  const [bookings, setBookings] = useState([])
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [tab, setTab] = useState('Overview')
  const [filter, setFilter] = useState('All patients')
  const [searchOpen, setSearchOpen] = useState(false)
  const [checkedIn, setCheckedIn] = useState(['Phoenix Baker'])
  useEffect(() => {
    try { window.localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(patients)) } catch { /* keep the live session usable when storage is unavailable */ }
  }, [patients])
  useEffect(() => {
    try { window.localStorage.setItem(MEDICATION_ORDER_STORAGE_KEY, JSON.stringify(medicationOrders)) } catch { /* keep the live session usable when storage is unavailable */ }
  }, [medicationOrders])
  useEffect(() => {
    try { window.localStorage.setItem(DOCTOR_NOTE_STORAGE_KEY, JSON.stringify(doctorNotes)) } catch { /* keep the live session usable when storage is unavailable */ }
  }, [doctorNotes])
  useEffect(() => {
    const syncSharedRecords = (event) => {
      if (event.key === MEDICATION_ORDER_STORAGE_KEY) {
        try {
          const orders = event.newValue ? JSON.parse(event.newValue) : []
          if (Array.isArray(orders)) setMedicationOrders(orders)
        } catch { /* ignore invalid data from another tab */ }
        return
      }
      if (event.key === DOCTOR_NOTE_STORAGE_KEY) {
        try {
          const notes = event.newValue ? JSON.parse(event.newValue) : []
          if (Array.isArray(notes)) setDoctorNotes(notes)
        } catch { /* ignore invalid data from another tab */ }
        return
      }
      if (event.key !== PATIENT_STORAGE_KEY) return
      try {
        const records = event.newValue ? JSON.parse(event.newValue) : initialPatients
        if (Array.isArray(records)) setPatients(records)
      } catch { /* ignore invalid data from another tab */ }
    }
    window.addEventListener('storage', syncSharedRecords)
    return () => window.removeEventListener('storage', syncSharedRecords)
  }, [])
  const isClinicalStaff = ['Doctor', 'Nurse', 'Medical laboratory scientist', 'Physiotherapist', 'Radiologist'].includes(staffRole)
  const hasFullClinicalAccess = ['Doctor', 'Nurse'].includes(staffRole)
  const isReception = staffRole === 'Front desk / Reception'
  const defaultPath = isReception ? '/reception' : '/dashboard'
  const canAccess = (page) => (page === 'Doctors notes' ? staffRole === 'Doctor' : isClinicalStaff) || page === 'Dashboard' || (isReception && ['Front desk / Reception', 'Patients'].includes(page)) || (staffRole === 'Billing' && page === 'Billing') || staffRole === page || (staffRole === 'Store / Inventory' && page === 'Inventory')
  const navigateTo = (page) => navigate(routeFor[page] || '/dashboard')
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800) }
  const prescribeMedication = (order) => {
    setMedicationOrders((current) => [order, ...current])
    notify(`Prescription sent to pharmacy · ${order.patientName}`)
  }
  const updateMedicationOrder = (orderId, updates) => setMedicationOrders((current) => current.map((order) => order.id === orderId ? { ...order, ...updates } : order))
  const saveDoctorNote = (note) => {
    setDoctorNotes((current) => [note, ...current])
    notify(`Doctor's note saved for ${note.patientName}`)
  }
  const openPatient = (patient) => {
    if (!isClinicalStaff) { notify('Clinical staff access is required to view patient charts.'); return }
    setTab('Overview')
    navigate(`/patients/${patient.id}`)
  }
  const filteredPatients = useMemo(() => patients.filter((patient) => `${patient.name} ${patient.id} ${isClinicalStaff ? patient.condition : ''}`.toLowerCase().includes(query.toLowerCase()) && matchesCareCategory(patient, filter)), [patients, query, filter, isClinicalStaff])
  const routeToken = location.pathname.split('/').pop()
  const routeLabel = Object.entries(routeFor).find(([, path]) => path.split('/').pop() === routeToken)?.[0] || 'Dashboard'
  const patientId = location.pathname.startsWith('/patients/') ? location.pathname.split('/')[2] : ''
  const patientOnPage = patients.find((patient) => patient.id === patientId)

  if (!signedIn) return <StaffLogin onSignIn={(role) => { setStaffRole(role); setSignedIn(true); navigate(role === 'Front desk / Reception' ? '/reception' : '/dashboard') }} />

  const visibleNavSections = staffRole === 'Doctor'
    ? navSections.filter((section) => section.label === 'WORKSPACE').map((section) => ({ ...section, items: section.items.filter(([label]) => canAccess(label)) }))
    : navSections.map((section) => ({ ...section, items: section.items.filter(([label]) => canAccess(label)) })).filter((section) => section.items.length)
  const startLogout = () => { setSignedIn(false); setStaffRole(''); setQuery(''); setSearchOpen(false); navigate('/login') }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'show' : ''}`}>
      <div className="brand"><div className="brand-mark"><span></span><span></span><span></span></div><span>care<span className="brand-light">flow</span></span><button className="sidebar-close" onClick={() => setMobileNav(false)}>×</button></div>
      <button className="workspace-switch"><div className="clinic-mark">N</div><div className="workspace-copy"><b>Northstar Clinic</b><small>San Francisco, CA</small></div><span className="chevron">⌄</span></button>
      <div className="nav-list">{visibleNavSections.map((section) => <div className="nav-section" key={section.label}><div className="nav-label">{section.label}</div>{section.items.map(([label,, badge]) => label === 'Medications' && ['Doctor','Nurse'].includes(staffRole) ? <div className="nav-medication-menu" key={label}><NavLink to="/medications?view=drug-chart" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => { setMobileNav(false); setSearchOpen(false) }}><Icon name={label}/><span>{label}</span><span className="medication-nav-chevron">v</span></NavLink><div className="nav-medication-options">{staffRole === 'Doctor' && <NavLink to="/medications?view=prescribe" onClick={() => { setMobileNav(false); setSearchOpen(false) }}>Prescribe</NavLink>}<NavLink to="/medications?view=drug-chart" onClick={() => { setMobileNav(false); setSearchOpen(false) }}>Drug chart</NavLink></div></div> : <NavLink key={label} to={routeFor[label]} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => { setMobileNav(false); setSearchOpen(false) }}><Icon name={label}/><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}</NavLink>)}</div>)}</div>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✳</div><b>Demo environment</b><p>Sample records for interface preview.</p><button onClick={() => notify('Support request started')}>Contact support <span>↗</span></button></div><div className="profile-menu"><button className="user-profile" type="button"><Avatar name="Alex Morgan" color="navy"/><span><b>Alex Morgan</b><small>{staffRole}</small></span><span className="more">···</span></button><button className="logout-popover" type="button" onClick={startLogout}>Log out <span>↪</span></button></div></div>
    </aside>
    {mobileNav && <button className="mobile-shade" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileNav(true)}>☰</button><div className="breadcrumbs"><span>Northstar Clinic</span><i>/</i><b>{patientOnPage?.name || routeLabel}</b></div></div><div className="topbar-actions"><button className="top-search" onClick={() => setSearchOpen(true)}><span>⌕</span><span>Search anything...</span><kbd>⌘ K</kbd></button><button className="icon-button" aria-label="Help" onClick={() => notify('Help center opened')}><span>?</span></button>{isClinicalStaff && <button className="notification" aria-label="Notifications" onClick={() => navigateTo('Inbox')}>♧<i></i></button>}<Avatar name="Alex Morgan" color="navy"/></div></header>
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Navigate to={defaultPath} replace/>}/>
          <Route path="/dashboard" element={<DashboardRoute role={staffRole} isClinicalStaff={isClinicalStaff} setPage={navigateTo} patients={patients} medicationOrders={medicationOrders} openPatient={openPatient} notify={notify} checkedIn={checkedIn} setCheckedIn={setCheckedIn}/>}/>
          <Route path="/reception" element={<PageAccess allowed={canAccess('Front desk / Reception')} fallback={defaultPath}><ReceptionPage patients={patients} bookings={bookings} onRegister={(patient) => { setPatients((current) => [patient, ...current]); notify(`Patient registered · ${patient.id}`) }} onBook={(booking) => { setBookings((current) => [booking, ...current]); notify(`Appointment booked for ${booking.patientName} with ${booking.doctor}`) }}/></PageAccess>}/>
          <Route path="/patients" element={<PageAccess allowed={canAccess('Patients')} fallback={defaultPath}><PatientsPage patients={filteredPatients} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} openPatient={openPatient} setPage={navigateTo} canViewClinical={isClinicalStaff}/></PageAccess>}/>
          <Route path="/patients/:patientId" element={<PageAccess allowed={isClinicalStaff} fallback={defaultPath}><PatientRecordRoute patients={patients} medicationOrders={medicationOrders} doctorNotes={doctorNotes} onSaveDoctorNote={saveDoctorNote} onPrescribe={prescribeMedication} onUpdateMedicationOrder={updateMedicationOrder} tab={tab} setTab={setTab} onBack={() => navigate('/patients')} onAction={notify} canViewAllResults={hasFullClinicalAccess} staffRole={staffRole}/></PageAccess>}/>
          <Route path="/schedule" element={<PageAccess allowed={canAccess('Schedule')} fallback={defaultPath}><SchedulePage notify={notify} checkedIn={checkedIn} setCheckedIn={setCheckedIn} setPage={navigateTo}/></PageAccess>}/>
          <Route path="/encounters" element={<PageAccess allowed={canAccess('Encounters')} fallback={defaultPath}><EncountersPage patients={patients} openPatient={openPatient} notify={notify}/></PageAccess>}/>
          <Route path="/inbox" element={<PageAccess allowed={canAccess('Inbox')} fallback={defaultPath}><InboxPage notify={notify}/></PageAccess>}/>
          <Route path="/lab-results" element={<PageAccess allowed={canAccess('Lab results')} fallback={defaultPath}><LabsPage notify={notify}/></PageAccess>}/>
          <Route path="/medications" element={<PageAccess allowed={canAccess('Medications')} fallback={defaultPath}><MedicationsPage staffRole={staffRole} patients={patients} medicationOrders={medicationOrders} onPrescribe={prescribeMedication} onUpdateMedicationOrder={updateMedicationOrder} notify={notify} mode={new URLSearchParams(location.search).get('view')}/></PageAccess>}/>
          <Route path="/documents" element={<PageAccess allowed={canAccess('Documents')} fallback={defaultPath}><DocumentsPage notify={notify}/></PageAccess>}/>
          <Route path="/billing" element={<PageAccess allowed={canAccess('Billing')} fallback={defaultPath}><BillingPage notify={notify}/></PageAccess>}/>
          <Route path="/reports" element={<PageAccess allowed={canAccess('Reports')} fallback={defaultPath}><ReportsPage notify={notify}/></PageAccess>}/>
          <Route path="/nursing/:slug" element={<PageAccess allowed={isClinicalStaff} fallback={defaultPath}><NursingRoute patients={patients} notify={notify} setPage={navigateTo} openPatient={openPatient}/></PageAccess>}/>
          <Route path="/services/:slug" element={<SpecialtyRoute patients={patients} medicationOrders={medicationOrders} notify={notify} canAccess={canAccess} defaultPath={defaultPath}/>}/>
          <Route path="*" element={<Navigate to={defaultPath} replace/>}/>
        </Routes>
      </div>
      <footer className="app-footer"><span>© 2026 Careflow Health</span><span><i className="secure-dot"/> Prototype workspace · Sample data</span><a href="#help" onClick={(event) => { event.preventDefault(); notify('Help center opened') }}>Help center</a></footer>
    </main>
    {searchOpen && <div className="modal-backdrop search-backdrop" onClick={() => setSearchOpen(false)}><div className="command-box" onClick={(event) => event.stopPropagation()}><div className="command-input"><span>⌕</span><input autoFocus placeholder="Search patients by name, ID, or contact..." value={query} onChange={(event) => setQuery(event.target.value)}/><kbd>ESC</kbd><button onClick={() => setSearchOpen(false)}>×</button></div><div className="command-label">PATIENTS</div>{filteredPatients.slice(0, 5).map((patient) => <button className="command-result" key={patient.id} onClick={() => { openPatient(patient); setSearchOpen(false) }}><Avatar name={patient.name} color={patient.color}/><span><b>{patient.name}</b><small>{patient.id} · {isClinicalStaff ? patient.condition : 'Patient record'}</small></span><span className="command-arrow">↵</span></button>)}<div className="command-hint">↑↓ to navigate <span>↵ to open</span></div></div></div>}
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>
}

function PageAccess({ allowed, fallback, children }) {
  return allowed ? children : <Navigate to={fallback} replace/>
}

function DashboardRoute({ role, setPage, notify, patients, medicationOrders, openPatient }) {
  return <RoleDashboardPage staffRole={role} setPage={setPage} notify={notify} patients={patients} medicationOrders={medicationOrders} openPatient={openPatient}/>
}

function PatientRecordRoute({ patients, medicationOrders, doctorNotes, onSaveDoctorNote, onPrescribe, onUpdateMedicationOrder, tab, setTab, onBack, onAction, canViewAllResults, staffRole }) {
  const { patientId } = useParams()
  const patient = patients.find((item) => item.id === patientId)
  return patient ? <PatientChart patient={patient} tab={tab} setTab={setTab} onBack={onBack} onAction={onAction} canViewAllResults={canViewAllResults} staffRole={staffRole} medicationOrders={medicationOrders} doctorNotes={doctorNotes} onSaveDoctorNote={onSaveDoctorNote} onPrescribe={onPrescribe} onUpdateMedicationOrder={onUpdateMedicationOrder}/> : <Navigate to="/patients" replace/>
}

function NursingRoute({ patients, notify, setPage, openPatient }) {
  const { slug } = useParams()
  const page = Object.keys(routeFor).find((label) => routeFor[label] === `/nursing/${slug}`) || 'Nurse station'
  if (page === 'Nurse station') return <NurseStationPage patients={patients} setPage={setPage} openPatient={openPatient} />
  return <NursingPage page={page} patients={patients} notify={notify} setPage={setPage}/>
}

function SpecialtyRoute({ patients, medicationOrders, notify, canAccess, defaultPath }) {
  const { slug } = useParams()
  const page = Object.keys(routeFor).find((label) => routeFor[label] === `/services/${slug}`) || 'Consultations'
  return <PageAccess allowed={canAccess(page)} fallback={defaultPath}>{page === 'Inventory' ? <InventoryPage notify={notify}/> : <SpecialtyPage page={page} patients={patients} notify={notify} medicationOrders={medicationOrders}/>}</PageAccess>
}

export default App
