import { useState } from 'react'
import { Avatar, Button, PageHeading, Metric, PanelHeader } from '../components/ui.jsx'
import { appointments } from '../data/demoData.js'

const dashboardContent = {
  Doctor: {
    eyebrow: 'PHYSICIAN WORKSPACE', title: 'Your clinical day', description: 'Review the visit queue, close care loops, and move between appointments.',
    metrics: [['Appointments','05','2 arriving soon','lavender'],['Open encounters','04','2 need signature','peach'],['Results to review','03','1 flagged','sky'],['Inbox','04','2 unread','mint']],
    section: 'Today’s patient list', context: 'Outpatient clinic · Rooms 1–3',
    work: [['Olivia Rhye','Annual physical','09:30 · Room 2','In visit'],['Phoenix Baker','Diabetes follow-up','10:00 · Room 1','Checked in'],['Lana Steiner','Migraine consultation','10:30 · Room 3','Arriving'],['Demi Wilkinson','Medication review','11:00 · Room 2','Confirmed']],
    actions: [['Consultations','Open your visit queue','Consultations','◷'],['Doctors notes','Continue documentation','Doctors notes','✎'],['Lab results','Review pending results','Lab results','⚗'],['Schedule','View the full calendar','Schedule','▦']],
    priority: ['Care loop to close','One result is flagged for review. Confirm the result, document the plan, and share follow-up with the patient.','Review results','Lab results'], primary: ['Start consultation','Consultations'],
  },
  Nurse: {
    eyebrow: 'NURSING WORKSPACE · DAY SHIFT', title: 'Shift overview', description: 'Coordinate observations, medication rounds, patient care, and a clear handover.',
    metrics: [['Outpatients','03','On today’s list','lavender'],['Observations due','04','2 need attention','peach'],['Medication round','08','Next at 11:00 AM','mint'],['Handover items','03','1 priority','sky']],
    section: 'Assigned patient care', context: 'Ward 2 · Medical · Updated just now',
    work: [['Olivia Rhye','Hypertension · observations due','Bed 04 · Review observations','Review due'],['Phoenix Baker','Diabetes follow-up','Clinic · Checked in','Ready'],['Lana Steiner','Migraine consultation','Clinic · Arriving','Routine'],['Candice Wu','Asthma · care plan review','Bed 02 · Stable','Routine']],
    actions: [['Nurse station','Review patient categories','Nurse station','✚'],['Vital signs','Record an observation set','Vital signs','⌁'],['Medication administration','Complete a medication round','Medication administration','＋'],['ISBAR handover','Prepare a safe handoff','ISBAR handover','⇄']],
    priority: ['Shift handover','Three handover items are open. Record outstanding observations, pending reviews, and safety needs before shift change.','Write nurses’ report','Nurses report'], primary: ['Open nurse station','Nurse station'],
  },
  'Medical laboratory scientist': {
    eyebrow: 'LABORATORY WORKSPACE', title: 'Lab operations', description: 'Track specimen flow, verification, and timely release of results.',
    metrics: [['Awaiting collection','08','3 priority','lavender'],['In process','14','Across benches','sky'],['Quality review','03','Pending verification','peach'],['Median turnaround','42 min','Today','mint']],
    section: 'Specimen and result queue', context: 'Bench overview · Updated just now',
    work: [['LAB-2684','CBC · EDTA blood','Olivia Rhye · 09:02','Collected'],['LAB-2683','HbA1c · Whole blood','Phoenix Baker · 08:56','In process'],['LAB-2681','Metabolic panel','Lana Steiner · 08:42','Quality review'],['LAB-2679','TSH · Serum','Demi Wilkinson · 08:15','Ready to verify']],
    actions: [['Laboratory','Open laboratory workflow','Laboratory','⚗'],['Lab results','Review and release results','Lab results','⌁'],['Documents','View specimen documents','Documents','▤'],['Reports','Review turnaround metrics','Reports','▥']],
    priority: ['Quality checkpoint','Verify patient identifiers, collection time, specimen type, and handling requirements before accepting or releasing a sample.','Open laboratory','Laboratory'], primary: ['Register specimen','Laboratory'],
  },
  Radiologist: {
    eyebrow: 'IMAGING WORKSPACE', title: 'Imaging worklist', description: 'Prioritize imaging requests, reporting, and critical result communication.',
    metrics: [['To protocol','07','2 urgent','lavender'],['Scheduled today','12','Across modalities','sky'],['Reports pending','05','2 priority','peach'],['Median turnaround','3.2 hrs','Today','mint']],
    section: 'Imaging worklist', context: 'Requests and reports · Updated just now',
    work: [['IMG-77102','Chest X-ray · 2 views','Olivia Rhye · 09:05','Protocolled'],['IMG-77101','Renal ultrasound','Phoenix Baker · 08:52','Scheduled'],['IMG-77098','Thyroid ultrasound','Demi Wilkinson · 08:30','Report pending'],['IMG-77094','Shoulder X-ray','Candice Wu · 08:12','Images ready']],
    actions: [['Radiology','Open imaging worklist','Radiology','◉'],['Lab results','Review linked diagnostics','Lab results','⌁'],['Documents','View imaging documents','Documents','▤'],['Reports','Review service activity','Reports','▥']],
    priority: ['Critical findings pathway','For urgent findings, follow local escalation policy and document who was notified, when, and the agreed next step.','Open imaging queue','Radiology'], primary: ['Review imaging queue','Radiology'],
  },
  Physiotherapist: {
    eyebrow: 'REHABILITATION WORKSPACE', title: 'Today’s caseload', description: 'Keep sessions, functional goals, and care plan reviews moving together.',
    metrics: [['Sessions today','09','2 new referrals','lavender'],['Initial assessments','03','1 urgent','peach'],['Plans to review','04','Due this week','sky'],['Attendance','92%','Last 30 days','mint']],
    section: 'Treatment schedule', context: 'Rehabilitation clinic · Today',
    work: [['Demi Wilkinson','Postural neck pain','Session 4 · 09:00','In session'],['Candice Wu','Shoulder mobility','Initial assessment · 10:30','Confirmed'],['Natali Craig','Low back pain','Session 2 · 11:15','Ready'],['Phoenix Baker','Activity plan','Review · 13:00','Plan review']],
    actions: [['Physiotherapy','Open today’s caseload','Physiotherapy','↗'],['Patients','Review patient records','Patients','♧'],['Schedule','View appointment calendar','Schedule','▦'],['Documents','Review referral documents','Documents','▤']],
    priority: ['Goal review','Four plans are due for review. Confirm current function, patient priorities, measurable goals, and response to interventions.','Open caseload','Physiotherapy'], primary: ['Start assessment','Physiotherapy'],
  },
  Pharmacy: {
    eyebrow: 'PHARMACY WORKSPACE', title: 'Dispensing overview', description: 'Review prescriptions, resolve clarifications, and keep dispensing safe and timely.',
    metrics: [['New prescriptions','11','Today','lavender'],['Ready to dispense','06','2 priority','mint'],['Clarifications','02','Prescriber review','peach'],['Dispensed','28','Today','sky']],
    section: 'Prescription queue', context: 'Medication services · Updated just now',
    work: [['Rx-94128','Metformin 500 mg · refill','Phoenix Baker · 09:18','Ready to dispense'],['Rx-94124','Lisinopril 10 mg','Olivia Rhye · 09:05','Clinical check'],['Rx-94119','Sumatriptan 50 mg','Lana Steiner · 08:47','Clarification'],['Rx-94112','Levothyroxine 75 mcg','Demi Wilkinson · 08:21','Ready to dispense']],
    actions: [['Pharmacy','Open prescription queue','Pharmacy','✚']],
    priority: ['Safe dispensing checks','Confirm patient identity, allergies, medication history, dose, route, and relevant interactions before dispensing.','Open pharmacy queue','Pharmacy'], primary: ['Review prescriptions','Pharmacy'],
  },
  'Front desk / Reception': {
    eyebrow: 'FRONT DESK WORKSPACE', title: 'Reception overview', description: 'Keep arrivals moving and help patients reach the right service.',
    metrics: [['Arrivals today','18','5 checked in','lavender'],['Waiting','03','2 arriving soon','peach'],['Registrations','06','Today','mint'],['Appointments','18','Today’s schedule','sky']],
    section: 'Arrival and booking queue', context: 'Front desk · Today',
    work: [['Olivia Rhye','Annual physical','09:30 · Dr. Morgan','In visit'],['Phoenix Baker','Diabetes follow-up','10:00 · Dr. Morgan','Checked in'],['Lana Steiner','Migraine consultation','10:30 · Dr. Patel','Arriving'],['Walk-in queue','2 patients','Check identity and visit type','Waiting']],
    actions: [['Front desk / Reception','Register or check in a patient','Front desk / Reception','＋'],['Patients','Find a patient record','Patients','♧']],
    priority: ['Registration checklist','Confirm identity and contact details, choose the correct arrival route, and check the generated EMR number.','Register patient','Front desk / Reception'], primary: ['Register arrival','Front desk / Reception'],
  },
  Billing: {
    eyebrow: 'REVENUE CYCLE WORKSPACE', title: 'Billing overview', description: 'Work claims, identify blockers, and keep balances moving toward resolution.',
    metrics: [['Claims to submit','24','6 high priority','lavender'],['In review','18','Payer response pending','sky'],['Denied claims','03','Action required','peach'],['Payments posted','$8,420','Today','mint']],
    section: 'Claims requiring attention', context: 'Revenue cycle · Updated just now',
    work: [['CL-20814','Outpatient visit','Olivia Rhye · Submitted 09:12','Payer review'],['CL-20811','Diabetes follow-up','Phoenix Baker · Submitted 08:50','Payer review'],['CL-20802','Medication review','Demi Wilkinson · Missing code','Needs review'],['CL-20798','Imaging service','Candice Wu · Denial received','Action required']],
    actions: [['Billing','Open claims and payments','Billing','＄']],
    priority: ['Denial follow-up','Three claims need attention. Review payer feedback, correct billing details, and record the resubmission plan.','Open billing','Billing'], primary: ['Review claims','Billing'],
  },
  'Store / Inventory': {
    eyebrow: 'SUPPLY OPERATIONS', title: 'Inventory overview', description: 'Monitor essential stock, incoming orders, and items that need replenishment.',
    metrics: [['Tracked items','248','Across departments','lavender'],['Low stock','12','4 critical','peach'],['Pending orders','08','3 due today','sky'],['Expiring soon','06','Next 30 days','mint']],
    section: 'Priority stock list', context: 'Supply and inventory · Updated just now',
    work: [['Gloves · nitrile M','Central store · 4 boxes','Par level 12 boxes','Reorder'],['Saline 0.9% · 1 L','Ward 2 · 8 bags','Par level 20 bags','Low stock'],['Syringes · 5 mL','Treatment room · 2 packs','Par level 10 packs','Low stock'],['Gauze dressings','Central store · 6 packs','Expires in 21 days','Expiry watch']],
    actions: [['Inventory','Open stock control','Inventory','▤']],
    priority: ['Replenishment','Prioritize critical items, confirm quantities on hand, and record a purchase request with the receiving department.','Open inventory','Inventory'], primary: ['Review stock','Inventory'],
  },
  'Other staff': {
    eyebrow: 'CARE OPERATIONS', title: 'Team workspace', description: 'A clear starting point for shared tasks, service updates, and team handoffs.',
    metrics: [['Team tasks','08','3 due today','lavender'],['Requests','04','Awaiting action','peach'],['Updates','06','Since last shift','sky'],['Service status','On track','Updated today','mint']],
    section: 'Team activity', context: 'Shared operations · Updated just now',
    work: [['Morning briefing','Review service priorities','08:30 · Team workspace','Ready'],['Equipment check','Confirm assigned area','Before first session','Due'],['Open request','Review latest team request','Operations queue','Pending']],
    actions: [], priority: ['Handoff essentials','Check updates from the previous shift, record completed work, and leave a clear owner and next step for open requests.','Review your role access','Dashboard'], primary: ['Review team activity','Dashboard'],
  },
}

function RoleDashboardPage({ staffRole, setPage, notify, patients = [], medicationOrders = [], openPatient }) {
  const [query, setQuery] = useState('')
  const config = dashboardContent[staffRole] || dashboardContent['Other staff']
  const clinicalRoles = ['Doctor','Nurse','Medical laboratory scientist','Radiologist','Physiotherapist','Pharmacy']
  const clinical = clinicalRoles.includes(staffRole)
  const outpatientPatients = patients.filter((patient) => (patient.route || patient.careSetting || 'Outpatient') === 'Outpatient')
  const arrivals = patients.filter((patient) => patient.status === 'Checked in' || /arrival/i.test(patient.lastVisit || ''))
  const pharmacyWork = medicationOrders.map((order) => [order.id, `${order.medication} · ${order.dose} · ${order.patientName}`, `${order.route} · ${order.frequency}`, order.status])
  const roleWork = staffRole === 'Pharmacy' && pharmacyWork.length ? pharmacyWork : staffRole === 'Nurse' && outpatientPatients.length ? outpatientPatients.slice(0, 4).map((patient) => [patient.name,patient.condition || 'Outpatient care',`${patient.id} · ${patient.lastVisit}`,patient.status]) : staffRole === 'Front desk / Reception' && arrivals.length ? arrivals.slice(0, 4).map((patient) => [patient.name,`${patient.id} · ${patient.route || 'Outpatient'}`,patient.lastVisit,patient.status]) : config.work
  const metrics = staffRole === 'Nurse' ? config.metrics.map((metric,index)=>index===0?[metric[0],String(outpatientPatients.length),metric[2],metric[3]]:metric) : staffRole === 'Front desk / Reception' ? config.metrics.map((metric,index)=>index===0?[metric[0],String(arrivals.length),metric[2],metric[3]]:index===2?[metric[0],String(arrivals.length),metric[2],metric[3]]:metric) : config.metrics
  const work = roleWork.filter((item) => item.join(' ').toLowerCase().includes(query.toLowerCase()))
  const handleAction = (target) => target === 'Dashboard' ? notify('This dashboard is your current workspace.') : setPage(target)
  const date = new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})
  if (staffRole === 'Doctor') return <DoctorDashboard setPage={setPage} patients={patients} openPatient={openPatient} date={date}/>
  if (staffRole === 'Nurse') return <NurseDashboard setPage={setPage} patients={patients} openPatient={openPatient} date={date}/>
  return <><PageHeading eyebrow={`${config.eyebrow} · ${date}`} title={config.title} description={config.description} action={<Button kind="primary" onClick={() => handleAction(config.primary[1])}>＋ {config.primary[0]}</Button>}/>
    <div className={`metric-grid role-metrics role-metrics-${roleSlug(staffRole)}`}>{metrics.map(([label,value,note,tone],i)=><Metric key={label} label={label} value={value} change={['Today','Needs review','In progress','Current'][i]} note={note} icon={['◷','⌁','✚','↗'][i]} tone={tone}/>)}</div><RolePulse staffRole={staffRole} setPage={setPage}/>
    <div className="role-dashboard-grid"><section className="panel role-worklist"><PanelHeader title={config.section} subtitle={config.context} action={<label className="role-search"><span>⌕</span><input aria-label="Filter worklist" placeholder="Filter worklist" value={query} onChange={(event)=>setQuery(event.target.value)}/></label>}/><div className="role-task-head"><span>{clinical?'PATIENT / ITEM':'TASK / ITEM'}</span><span>DETAILS</span><span>STATUS</span><span></span></div>
      {work.map((item,index)=><div className="role-task-row" key={`${item[0]}-${item[1]}`}><span className="role-task-title">{clinical&&<Avatar name={item[0]} color={['rose','blue','amber','violet'][index%4]}/>}<span><b>{item[0]}</b><small>{item[1]}</small></span></span><span className="role-task-detail">{item[2]}</span><span className={`role-task-status ${index===0?'attention':''}`}>{item[3]}</span><button type="button" className="role-open" onClick={()=>handleAction(config.primary[1])}>Open <span>→</span></button></div>)}
      {!work.length&&<div className="role-empty">No work items match “{query}”.</div>}<div className="role-worklist-foot"><span>Demo workspace · Sample operational data</span><button type="button" className="text-link" onClick={()=>handleAction(config.primary[1])}>Open full worklist →</button></div></section>
      <div className="role-side-column"><section className="panel role-actions-panel"><PanelHeader title="Quick actions" subtitle="Common tasks for your role"/><div className="role-action-list">{config.actions.length?config.actions.map(([title,detail,target,icon])=><button type="button" className="role-action" key={title} onClick={()=>handleAction(target)}><i>{icon}</i><span><b>{title}</b><small>{detail}</small></span><span className="role-action-arrow">→</span></button>):<p className="role-no-actions">Your available workspace links depend on the permissions assigned to your account.</p>}</div></section>
      <section className="role-focus-card"><span className="eyebrow">PRIORITY WORKFLOW</span><h2>{config.priority[0]}</h2><p>{config.priority[1]}</p><button type="button" onClick={()=>handleAction(config.priority[3])}>{config.priority[2]} <span>→</span></button></section><section className="role-status-panel"><span className="role-status-dot"/><span><b>Workspace ready</b><small>Sample data · Refreshed just now</small></span><button type="button" aria-label="Clear worklist filter" onClick={()=>setQuery('')}>↻</button></section></div>
    </div></>
}

function roleSlug(role) { return role.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') }

function DoctorDashboard({ setPage, patients, openPatient, date }) {
  const doctorName = 'Dr. Alex Morgan'
  const doctorAppointments = appointments.filter((appointment) => appointment.doctor === doctorName)
  return <><PageHeading eyebrow={`DOCTOR WORKSPACE · ${date}`} title={`Welcome, ${doctorName}`} description="Your appointments, clinical priorities, results, and encounter documentation for today." action={<Button kind="primary" onClick={()=>setPage('Consultations')}>＋ Start consultation</Button>}/>
    <div className="metric-grid doctor-metrics"><Metric label="Today's visits" value={String(doctorAppointments.length).padStart(2,'0')} change="2 arriving soon" note="Next at 10:00 AM" icon="◷" tone="lavender"/><Metric label="Open encounters" value="04" change="2 need signature" note="Documentation queue" icon="▤" tone="peach"/><Metric label="Results to review" value="03" change="1 flagged" note="Clinical inbox" icon="⌁" tone="sky"/><Metric label="Care follow-ups" value="06" change="2 due today" note="Across active patients" icon="↗" tone="mint"/></div>
    <div className="doctor-dashboard-grid"><section className="panel doctor-schedule"><PanelHeader title="Today's appointments" subtitle={`${doctorName} · Outpatient clinic`} action={<button className="text-link" onClick={()=>setPage('Schedule')}>Open calendar →</button>}/><div className="doctor-visit-list">{doctorAppointments.map((visit,index)=>{const patient=patients.find(item=>item.name===visit.name);return <div className={`doctor-visit ${index===0?'visit-current':''}`} key={visit.time}><time>{visit.time}</time><span className="doctor-timeline"><i/></span><Avatar name={visit.name} color={visit.color}/><span className="doctor-visit-copy"><b>{visit.name}</b><small>{visit.kind} · {visit.doctor}</small></span><span className={`doctor-visit-state ${index===0?'visit-live':''}`}>{visit.status}</span><button type="button" aria-label={`Open ${visit.name}`} onClick={()=>patient&&openPatient(patient)}>Open</button></div>})}</div><div className="doctor-panel-foot"><span>Clinic flow</span><b><i style={{width:'62%'}}/>62% complete</b></div></section>
      <div className="doctor-priority-column"><section className="panel doctor-results"><PanelHeader title="Clinical priorities" subtitle="Items that need your review" action={<button className="text-link" onClick={()=>setPage('Inbox')}>View inbox →</button>}/><button className="doctor-priority-item" onClick={()=>setPage('Lab results')}><i className="priority-icon peach">⌁</i><span><b>Result flagged for review</b><small>CBC panel · Olivia Rhye · 8:42 AM</small></span><em>Review</em></button><button className="doctor-priority-item" onClick={()=>setPage('Doctors notes')}><i className="priority-icon lavender">▤</i><span><b>Encounter needs signature</b><small>Diabetes follow-up · Phoenix Baker</small></span><em>Sign</em></button><button className="doctor-priority-item" onClick={()=>setPage('Inbox')}><i className="priority-icon sky">✉</i><span><b>Patient message</b><small>Refill request · Phoenix Baker</small></span><em>Reply</em></button></section><section className="doctor-action-strip"><span><b>Continue your workflow</b><small>Documentation and follow-up</small></span><button onClick={()=>setPage('Doctors notes')}>New clinical note <i>→</i></button><button onClick={()=>setPage('Lab results')}>Review results <i>→</i></button></section></div>
    </div><section className="doctor-clinical-banner"><span className="doctor-banner-mark">✚</span><span><b>Connected care, one patient at a time</b><small>Keep results, decisions, and follow-up plans linked to the encounter.</small></span><button onClick={()=>setPage('Encounters')}>Open encounters →</button></section>
  </>
}

function NurseDashboard({ setPage, patients, openPatient, date }) {
  const counts = ['Inpatient','Outpatient','Emergency'].map((type)=>[type,patients.filter((patient)=>(patient.route||patient.careSetting||'Outpatient')===type).length])
  const assigned = patients.slice(0,5)
  return <><PageHeading eyebrow={`NURSING WORKSPACE · DAY SHIFT · ${date}`} title="Shift coordination" description="A bedside view of your patient census, observations, rounds, and handover." action={<Button kind="primary" onClick={()=>setPage('Nurse station')}>Open patient census</Button>}/>
    <div className="metric-grid nurse-metrics"><Metric label="Assigned patients" value={assigned.length} change="Across care areas" note="Current patient list" icon="♧" tone="lavender"/><Metric label="Observations due" value="04" change="2 need attention" note="Next due 10:30 AM" icon="⌁" tone="peach"/><Metric label="Medication round" value="08" change="Next at 11:00 AM" note="Scheduled administrations" icon="＋" tone="mint"/><Metric label="Handover items" value="03" change="1 priority" note="Open from previous shift" icon="⇄" tone="sky"/></div>
    <section className="panel nurse-census-panel"><PanelHeader title="Patient census" subtitle="Select a care area to see current patient counts" action={<button className="text-link" onClick={()=>setPage('Nurse station')}>Manage census →</button>}/><div className="nurse-census-cards">{counts.map(([type,count])=><div className={`nurse-census-card census-${roleSlug(type)}`} key={type}><span>{type}</span><b>{count.toString().padStart(2,'0')}</b><small>{type==='Inpatient'?'Admitted care':type==='Outpatient'?'Clinic and walk-in':'Triage and urgent care'}</small></div>)}</div></section>
    <div className="nurse-dashboard-grid"><section className="panel nurse-assigned-panel"><PanelHeader title="Assigned care" subtitle="Current patient list · Updated just now" action={<button className="text-link" onClick={()=>setPage('Vital signs')}>Record observations →</button>}/><div className="nurse-assigned-list">{assigned.map((patient,index)=><div className="nurse-assigned-row" key={patient.id}><Avatar name={patient.name} color={patient.color}/><span><b>{patient.name}</b><small>{patient.id} · {patient.condition || patient.route || 'Patient care'}</small></span><span className={`nurse-care-state ${index===0?'care-review':''}`}>{index===0?'Observation due':patient.status}</span><button onClick={()=>openPatient(patient)}>Care record →</button></div>)}</div></section>
      <div className="nurse-shift-column"><section className="panel nurse-rounds-panel"><PanelHeader title="Shift checklist" subtitle="Day shift · Ward 2"/><div className="nurse-round"><span className="round-time">10:30</span><i className="round-dot urgent"/><span><b>Observation round</b><small>4 patients due</small></span><button onClick={()=>setPage('Vital signs')}>Start</button></div><div className="nurse-round"><span className="round-time">11:00</span><i className="round-dot"/><span><b>Medication round</b><small>8 scheduled administrations</small></span><button onClick={()=>setPage('Medication administration')}>Open</button></div><div className="nurse-round"><span className="round-time">14:30</span><i className="round-dot"/><span><b>Care plan review</b><small>2 plans due today</small></span><button onClick={()=>setPage('Care plans')}>Review</button></div></section><section className="nurse-handover-card"><span className="eyebrow">HANDOVER</span><b>3 open items</b><p>Capture pending reviews, safety needs, and the next action for each patient.</p><button onClick={()=>setPage('ISBAR handover')}>Prepare ISBAR handover →</button></section></div>
    </div>
  </>
}

function RolePulse({ staffRole, setPage }) {
  if (staffRole === 'Medical laboratory scientist') return <section className="role-pulse lab-pulse"><div><span className="eyebrow">SPECIMEN FLOW</span><b>Bench pipeline</b></div>{[['Collected','08','done'],['Processing','14','active'],['Verification','03','waiting'],['Released','26','done']].map(([label,count,state])=><div className="lab-stage" key={label}><i className={`stage-dot ${state}`}/><span><b>{count}</b><small>{label}</small></span></div>)}<button onClick={()=>setPage('Laboratory')}>Open bench queue →</button></section>
  if (staffRole === 'Radiologist') return <section className="role-pulse radiology-pulse"><div><span className="eyebrow">MODALITY STATUS</span><b>Imaging capacity</b></div>{[['X-ray','4 exams','2 ready'],['Ultrasound','5 exams','1 urgent'],['CT','3 exams','In progress']].map(([label,count,note])=><div className="modality-chip" key={label}><b>{label}</b><span>{count}</span><small>{note}</small></div>)}<button onClick={()=>setPage('Radiology')}>Open imaging queue →</button></section>
  if (staffRole === 'Physiotherapist') return <section className="role-pulse physio-pulse"><div><span className="eyebrow">FUNCTIONAL OUTCOMES</span><b>Caseload pulse</b></div><div className="physio-goal"><b>18</b><span><small>Active goals</small><i><em style={{width:'72%'}}/></i></span></div><div className="physio-goal"><b>13</b><span><small>On track this week</small><i><em style={{width:'84%'}}/></i></span></div><div className="physio-next"><small>Next session</small><b>10:30 AM · Shoulder mobility</b></div><button onClick={()=>setPage('Physiotherapy')}>Open caseload →</button></section>
  if (staffRole === 'Pharmacy') return <section className="role-pulse pharmacy-pulse"><div><span className="eyebrow">DISPENSING FLOW</span><b>Prescription pipeline</b></div>{[['Clinical check','03'],['Ready','06'],['Awaiting pickup','09'],['Completed','28']].map(([label,count])=><div className="rx-stage" key={label}><b>{count}</b><small>{label}</small></div>)}<button onClick={()=>setPage('Pharmacy')}>Open dispensing queue →</button></section>
  if (staffRole === 'Front desk / Reception') return <section className="role-pulse reception-pulse"><div><span className="eyebrow">ARRIVAL FLOW</span><b>Today at the front desk</b></div>{[['Expected','18','calendar'],['Checked in','05','check'],['Waiting','03','wait'],['Walk-ins','02','walkin']].map(([label,count,tone])=><div className={`arrival-stage arrival-${tone}`} key={label}><b>{count}</b><small>{label}</small></div>)}<button onClick={()=>setPage('Front desk / Reception')}>Register or check in →</button></section>
  if (staffRole === 'Billing') return <section className="role-pulse billing-pulse"><div><span className="eyebrow">CLAIM AGING</span><b>Receivables overview</b></div>{[['0–7 days','$12.4k',72],['8–30 days','$6.8k',48],['31–60 days','$2.1k',26],['60+ days','$940',12]].map(([label,value,width])=><div className="aging-stage" key={label}><span><small>{label}</small><b>{value}</b></span><i><em style={{width:`${width}%`}}/></i></div>)}<button onClick={()=>setPage('Billing')}>Review claims →</button></section>
  if (staffRole === 'Store / Inventory') return <section className="role-pulse inventory-pulse"><div><span className="eyebrow">STOCK HEALTH</span><b>Supply categories</b></div>{[['Medicines','82%','good'],['PPE','54%','low'],['Consumables','68%','good'],['Critical supplies','31%','critical']].map(([label,value,state])=><div className="stock-stage" key={label}><span><b>{label}</b><small>{value} of par</small></span><i className={`stock-bar ${state}`}><em style={{width:value}}/></i></div>)}<button onClick={()=>setPage('Inventory')}>Review stock →</button></section>
  return <section className="role-pulse general-pulse"><div><span className="eyebrow">SHIFT SNAPSHOT</span><b>Shared team operations</b></div><p>Keep requests owned, document completed checks, and leave a clear next step for the incoming team.</p><button onClick={()=>setPage(staffRole==='Other staff'?'Dashboard':'Reports')}>Review team activity →</button></section>
}

export { RoleDashboardPage }
