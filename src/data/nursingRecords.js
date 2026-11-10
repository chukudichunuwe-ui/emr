const STORAGE_KEY = 'emr-nursing-records-v1'

const demoNursingRecords = (() => {
  const patientId = 'PT-10476'
  const patientName = 'Bill Banda'
  const records = []
  const add = (day, time, type, values, shift = 'Day shift') => {
    const date = `2026-11-${String(day).padStart(2, '0')}`
    records.push({ id: `DEMO-TB-NUR-${day}-${time.replace(':', '')}-${type.replace(/[^a-z]/gi, '')}`, patientId, patientName, type, date, time, nurse: `Demo nurse · ${shift}`, values, demo: true, createdAt: `${date}T${time}:00.000Z` })
  }
  add(1, '08:00', 'Initial assessment', {
    'Arrival mode': 'Transfer', Consciousness: 'Alert', 'Pain score (0–10)': '2', Mobility: 'Independent', 'Fall risk': 'Low', 'Skin integrity': 'Intact', 'Nutrition screening': 'Monitor', 'Safeguarding concern': 'No',
    'Presenting concern': 'Three-week productive cough, fever, night sweats, reduced appetite, unintentional weight loss and occasional blood-streaked sputum. Admitted for investigation; active pulmonary TB subsequently confirmed.',
    'Initial nursing observations': 'Febrile, mildly tachycardic, oxygen saturation 93% on room air. Alert and speaking in full sentences without marked respiratory distress. Airborne infection isolation commenced; notify receiving staff before transport.',
    'Patient goals and preferences': 'Patient requests clear explanations and support to maintain contact with family while in isolation.'
  })
  const temperatures = [38.4,38.1,37.9,37.7,37.5,37.3,37.2,37.0,36.9,36.8]
  const pulses = [108,104,100,96,92,88,84,82,80,78]
  const oxygen = [93,93,94,94,95,95,96,96,97,97]
  for (let day = 1; day <= 10; day += 1) {
    for (const [time] of [['06:00'],['14:00'],['22:00']]) {
      const temp = (temperatures[day-1] + (time==='06:00' && day<5 ? 0.2 : time==='22:00' ? -0.1 : 0)).toFixed(1)
      const pulse = pulses[day-1] + (time==='06:00' && day<4 ? 2 : 0)
      add(day,time,'Vital signs',{
        'Blood pressure': '126/78', 'Heart rate': String(pulse), 'Respiratory rate': String(day<3?22:day<6?20:18), Temperature: temp, 'Oxygen saturation': String(Math.max(92,oxygen[day-1] - (time==='06:00'&&day<3?1:0))), 'Pain score': day<4?'2':'1',
        'Oxygen delivery': 'Room air', Consciousness: 'Alert', 'Early warning score': day<3?'3–4':day<5?'1–2':'0',
        'Clinical note': day<4?'Persistent cough; fever noted. Airborne precautions maintained and TB team plan followed.':'Cough persists but fever has settled; no new breathlessness reported. Airborne precautions remain in place pending TB-service/infection-control review.'
      }, time === '22:00' ? 'Night shift' : time === '14:00' ? 'Evening shift' : 'Day shift')
    }
    const fluidEntries = [
      ['06:30','Oral fluids',180,'Urine',250,'Morning intake and output recorded.'],
      ['10:00','Oral fluids',250,'Urine',200,'Oral fluids tolerated; output measured.'],
      ['14:00','Oral fluids',300,'Urine',300,'Midday intake and output recorded.'],
      ['20:00','Oral fluids',250,'Urine',250,'Evening intake and output recorded.']
    ]
    for (const [time,intakeType,intake,outputType,output,note] of fluidEntries) add(day,time,'Fluid balance',{'Chart date':`2026-11-${String(day).padStart(2,'0')}`,Time:time,'Intake type':intakeType,'Intake amount':String(intake),'Output type':outputType,'Output amount':String(output),'Fluid notes':`${note} Simulated demo entry.`},time < '12:00' ? 'Day shift' : 'Evening shift')
    add(day,'07:00','ISBAR handover',{
      Identify: `${patientName} · ${patientId} · Inpatient`,
      Situation: day<4?'Confirmed pulmonary TB; cough and intermittent fever continue.':'Confirmed pulmonary TB; fever improving, residual cough persists.',
      Background: 'Sputum molecular test detected M. tuberculosis; rifampicin resistance not detected. Culture and final susceptibility pending. Airborne precautions in place.',
      Assessment: `Patient alert; latest vital signs and respiratory trend are charted for day ${day} of admission. Room air; monitor cough, temperature and oxygen saturation.`,
      Recommendation: 'Maintain airborne infection precautions and appropriate respiratory protection per facility policy. Continue observations and fluid chart; follow TB-service plan and pending results.',
      'Receiving clinician': 'Demo receiving nurse', 'Handover time': '07:00'
    })
    add(day,'19:00','Nurses report',{
      Shift: 'Day', 'Report date': `2026-11-${String(day).padStart(2,'0')}`,
      'Patient status and events': day<4?'Cough and intermittent fever observed; patient alert and settled. Airborne isolation maintained. Observation and fluid records updated.':'Patient alert, afebrile during this shift and mobilising in room. Residual cough; airborne isolation maintained.',
      'Outstanding tasks': 'Continue overnight observations and fluid chart. Follow sputum culture/susceptibility and TB-service plan; escalate any respiratory deterioration.',
      'Safety and environment': 'Airborne isolation signage and room precautions checked; patient reminded to follow cough etiquette and use a mask for essential transport per facility policy.',
      'Outgoing nurse': 'Demo day nurse', 'Incoming nurse': 'Demo evening nurse'
    })
  }
  add(1,'09:00','Care plans',{'Problem / nursing diagnosis':'Risk of airborne transmission','Assessment evidence':'Bacteriologically confirmed pulmonary TB; cough and positive sputum tests.','Patient centered goal':'Reduce exposure risk to other patients, visitors and staff during admission.','Nursing interventions':'Maintain airborne infection isolation, use facility-approved respiratory PPE, follow specimen collection precautions, and coordinate transfers with receiving areas.','Evaluation / response':'Precautions initiated and checked each shift.','Review date':'2026-11-02','Status':'Active'})
  add(1,'09:10','Care plans',{'Problem / nursing diagnosis':'Ineffective respiratory symptom management','Assessment evidence':'Persistent productive cough, fever and room-air oxygen saturation below baseline at admission.','Patient centered goal':'Maintain stable respiratory status and promptly report worsening breathlessness or haemoptysis.','Nursing interventions':'Trend respiratory rate, temperature and oxygen saturation; assess cough/sputum; escalate deterioration using facility pathway.','Evaluation / response':'Observations commenced; review each shift.','Review date':'2026-11-02','Status':'Active'})
  add(1,'09:20','Care plans',{'Problem / nursing diagnosis':'Reduced appetite and risk of inadequate intake','Assessment evidence':'Patient reports reduced appetite and weight loss before admission.','Patient centered goal':'Maintain oral hydration and improve meal intake as tolerated.','Nursing interventions':'Record oral intake and output, offer meals/fluids as appropriate, document tolerance, and request dietetic review if indicated.','Evaluation / response':'Fluid chart started; intake improving over admission.','Review date':'2026-11-04','Status':'Active'})
  add(6,'09:00','Care plans',{'Problem / nursing diagnosis':'TB infection-control and treatment continuity','Assessment evidence':'Fever settled; culture and susceptibility results remain pending.','Patient centered goal':'Understand airborne precautions and the importance of completing TB-service treatment and follow-up.','Nursing interventions':'Reinforce education, use teach-back, coordinate with TB team and public-health pathway, and include outstanding results in handover.','Evaluation / response':'Patient explains the need for follow-up; continue education and assess understanding.','Review date':'2026-11-10','Status':'Active'})
  return records.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))
})()

function readNursingRecords() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    const entries = Array.isArray(stored) ? stored : []
    const combined = [...entries, ...demoNursingRecords.filter((demo) => !entries.some((entry) => entry.id === demo.id))]
    return combined.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  } catch { return demoNursingRecords }
}

function saveNursingRecord(record) {
  const next = [record, ...readNursingRecords()]
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* keep the active chart usable if storage is unavailable */ }
  window.dispatchEvent(new CustomEvent('emr-nursing-records-updated'))
  return next
}

export { readNursingRecords, saveNursingRecord }
