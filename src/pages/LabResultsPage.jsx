/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { initialPatients, initials, demoAccounts, postedResults, appointments } from '../data/demoData.js'
import { Avatar, Button, PageHeading, Metric, PanelHeader, QuickAction, AttentionItem, StatusTag, Detail, EncounterLine } from '../components/ui.jsx'

function resultTone(result) {
  const text = String(result).toLowerCase()
  if (/within (reference )?range|within range|no acute|unremarkable|negative for|no evidence of/.test(text)) return 'normal'
  if (/above target|below target|below reference range|above reference range|out of range|abnormal|elevated|detected|\b(low|high|positive|critical)\b|flagged/.test(text)) return 'abnormal'
  return 'neutral'
}

const seededLabs = [
  { name: 'Olivia Rhye', panel: 'Complete blood count (CBC)', ordered: 'Oct 13, 2026 · 8:42 AM', result: 'All values within reference range', status: 'Needs review', color: 'rose' },
  { name: 'Phoenix Baker', panel: 'Hemoglobin A1c', ordered: 'Oct 13, 2026 · 8:31 AM', result: '7.2% · Above target', status: 'Needs review', color: 'blue' },
  { name: 'Lana Steiner', panel: 'Comprehensive metabolic panel', ordered: 'Oct 12, 2026 · 3:15 PM', result: 'All values within reference range', status: 'Needs review', color: 'amber' },
  { name: 'Demi Wilkinson', panel: 'Thyroid stimulating hormone', ordered: 'Oct 11, 2026 · 10:04 AM', result: '2.4 mIU/L · Within range', status: 'Reviewed', color: 'violet' },
  ...postedResults.filter((result) => result.patient === 'Bill Banda' && result.type === 'Lab').map((result) => ({ name: result.patient, panel: result.title, ordered: result.date, result: result.result, status: 'Needs review', color: 'teal' })),
]

function LabsPage({ notify }) { const [filter, setFilter] = useState('Needs review'); const [labs, setLabs] = useState(seededLabs); return <><PageHeading eyebrow="RESULTS MANAGEMENT" title="Lab results" description="Review, interpret, and share diagnostic results." action={<Button onClick={() => notify('Lab order form opened')}>＋ Order labs</Button>}/><div className="tab-filters">{['Needs review', 'Reviewed', 'All results'].map((v) => <button className={filter === v ? 'selected' : ''} onClick={() => setFilter(v)} key={v}>{v}<span>{v === 'All results' ? labs.length : labs.filter((lab) => lab.status === v).length}</span></button>)}</div><div className="panel list-panel"><div className="list-panel-head labs-head"><span>PATIENT & TEST</span><span>RESULT</span><span>RECEIVED</span><span>STATUS</span><span></span></div>{labs.filter((l) => filter === 'All results' || l.status === filter).map((lab) => <div className="lab-row" key={lab.panel}><span className="patient-cell"><Avatar name={lab.name} color={lab.color}/><span><b>{lab.name}</b><small>{lab.panel}</small></span></span><span className={`clinical-result-${resultTone(lab.result)}`}>{lab.result}</span><span>{lab.ordered}</span><span className={`status-tag ${lab.status === 'Reviewed' ? 'completed' : 'in-visit'}`}><i/>{lab.status}</span><Button onClick={() => { setLabs(labs.map((l) => l === lab ? { ...l, status: 'Reviewed' } : l)); notify(`Results for ${lab.name} marked as reviewed`) }}>{lab.status === 'Reviewed' ? 'View' : 'Review'}</Button></div>)}</div></> }

export { LabsPage }
