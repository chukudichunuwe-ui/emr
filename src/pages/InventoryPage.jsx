import { useMemo, useState } from 'react'
import { Button, Metric, PageHeading, PanelHeader } from '../components/ui.jsx'

const startingStock = [
  { sku:'MED-00184', name:'Gloves · nitrile M', location:'Central store', quantity:4, unit:'boxes', par:12, expiry:'—', status:'Reorder' },
  { sku:'MED-00312', name:'Saline 0.9% · 1 L', location:'Ward 2', quantity:8, unit:'bags', par:20, expiry:'Feb 2027', status:'Low stock' },
  { sku:'SUP-00205', name:'Syringes · 5 mL', location:'Treatment room', quantity:2, unit:'packs', par:10, expiry:'—', status:'Low stock' },
  { sku:'SUP-00091', name:'Gauze dressings', location:'Central store', quantity:6, unit:'packs', par:10, expiry:'Nov 9, 2026', status:'Expiry watch' },
  { sku:'MED-00441', name:'Paracetamol · 500 mg', location:'Pharmacy store', quantity:36, unit:'boxes', par:24, expiry:'Aug 2027', status:'In stock' },
]

function InventoryPage({ notify }) {
  const [items, setItems] = useState(startingStock)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All items')
  const [modal, setModal] = useState(false)
  const [receipt, setReceipt] = useState({ sku:'', quantity:'', location:'' })
  const visibleItems = useMemo(() => items.filter((item) => `${item.sku} ${item.name} ${item.location}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'All items' || item.status === filter)), [items, query, filter])
  const saveReceipt = (event) => {
    event.preventDefault()
    const amount = Number(receipt.quantity)
    if (!receipt.sku || amount <= 0) return
    setItems((current) => current.map((item) => item.sku === receipt.sku ? { ...item, quantity: item.quantity + amount, location: receipt.location || item.location, status: item.quantity + amount >= item.par ? 'In stock' : 'Low stock' } : item))
    notify('Stock receipt recorded')
    setModal(false)
    setReceipt({ sku:'', quantity:'', location:'' })
  }
  return <><PageHeading eyebrow="SUPPLY OPERATIONS" title="Inventory control" description="Monitor stock levels, expiry dates, and incoming supplies across departments." action={<Button kind="primary" onClick={()=>setModal(true)}>＋ Record stock receipt</Button>}/>
    <div className="metric-grid"><Metric label="Tracked items" value={items.length} change="Across locations" note="Current catalogue" icon="▤" tone="lavender"/><Metric label="Low stock" value={items.filter(i=>i.status==='Low stock'||i.status==='Reorder').length} change="2 require action" note="Below par level" icon="⌁" tone="peach"/><Metric label="Pending orders" value="08" change="3 due today" note="Awaiting delivery" icon="↗" tone="sky"/><Metric label="Expiring soon" value={items.filter(i=>i.status==='Expiry watch').length} change="Next 30 days" note="Check and rotate stock" icon="◷" tone="mint"/></div>
    <section className="panel inventory-panel"><PanelHeader title="Stock list" subtitle="Current on-hand quantities by location" action={<div className="inventory-tools"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search stock" aria-label="Search stock"/><select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter stock status"><option>All items</option><option>In stock</option><option>Low stock</option><option>Reorder</option><option>Expiry watch</option></select></div>}/><div className="inventory-table"><div className="inventory-head"><span>ITEM</span><span>LOCATION</span><span>ON HAND</span><span>PAR LEVEL</span><span>EXPIRY</span><span>STATUS</span></div>{visibleItems.map(item=><div className="inventory-row" key={item.sku}><span><b>{item.name}</b><small>{item.sku}</small></span><span>{item.location}</span><span><b>{item.quantity} {item.unit}</b></span><span>{item.par} {item.unit}</span><span>{item.expiry}</span><span className={`inventory-status ${item.status==='In stock'?'stock-ok':'stock-alert'}`}>{item.status}</span></div>)}{!visibleItems.length&&<div className="inventory-empty">No stock items match this search.</div>}</div></section>
    {modal&&<div className="modal-backdrop" onClick={()=>setModal(false)}><form className="modal" onSubmit={saveReceipt} onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">INVENTORY CONTROL</span><h2>Record stock receipt</h2><p>Update on-hand quantity after delivery.</p></div><button type="button" className="close-button" onClick={()=>setModal(false)}>×</button></div><div className="form-grid"><label className="span-two">Stock item<select value={receipt.sku} onChange={e=>setReceipt({...receipt,sku:e.target.value})} required><option value="" disabled>Select stock item</option>{items.map(item=><option key={item.sku} value={item.sku}>{item.name} · {item.sku}</option>)}</select></label><label>Quantity received<input type="number" min="1" value={receipt.quantity} onChange={e=>setReceipt({...receipt,quantity:e.target.value})} required/></label><label>Receiving location<input placeholder="e.g. Central store" value={receipt.location} onChange={e=>setReceipt({...receipt,location:e.target.value})}/></label></div><div className="modal-actions"><Button type="button" onClick={()=>setModal(false)}>Cancel</Button><Button kind="primary" type="submit">Save receipt →</Button></div></form></div>}
  </>
}

export { InventoryPage }
