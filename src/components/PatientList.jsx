import { useState, useRef } from 'react'

const SEVERITY_ORDER = ['unstable', 'watcher', 'stable']

const SEVERITY_LABEL = {
  stable:   { label: 'Stable',   emoji: '🟢', cls: 'stable'   },
  watcher:  { label: 'Watcher',  emoji: '🟡', cls: 'watcher'  },
  unstable: { label: 'Unstable', emoji: '🔴', cls: 'unstable' },
}

export default function PatientList({ patients, onAdd, onEdit, onDelete, onReorder }) {
  const [groupBySeverity, setGroupBySeverity] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx]  = useState(null)
  const dragRef = useRef(null)

  /* ── flat drag-and-drop (custom order only) ── */
  const handleDragStart = (e, idx) => {
    setDragIdx(idx)
    dragRef.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx(idx)
  }
  const handleDrop = (e, idx) => {
    e.preventDefault()
    if (dragRef.current === null || dragRef.current === idx) {
      setDragIdx(null); setOverIdx(null); return
    }
    const reordered = [...patients]
    const [moved] = reordered.splice(dragRef.current, 1)
    reordered.splice(idx, 0, moved)
    onReorder(reordered)
    setDragIdx(null); setOverIdx(null); dragRef.current = null
  }
  const handleDragEnd = () => { setDragIdx(null); setOverIdx(null) }

  /* ── move by button ── */
  const moveUp   = (idx) => { if (idx === 0) return; swap(idx, idx - 1) }
  const moveDown = (idx) => { if (idx === patients.length - 1) return; swap(idx, idx + 1) }
  const swap = (a, b) => {
    const arr = [...patients]
    ;[arr[a], arr[b]] = [arr[b], arr[a]]
    onReorder(arr)
  }

  if (patients.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <div className="icon">🏥</div>
            <p>No patients yet. Click <strong>Add Patient</strong> to begin your handoff.</p>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={onAdd}>＋ Add Patient</button>
          </div>
        </div>
      </div>
    )
  }

  const renderPatientCard = (patient, idx, draggable = true) => {
    const sev = SEVERITY_LABEL[patient.illnessSeverity] || SEVERITY_LABEL.stable
    const isDragging = dragIdx === idx
    const isOver     = overIdx  === idx

    return (
      <div
        key={patient.id}
        className={`card patient-card ${isDragging ? 'dragging' : ''}`}
        style={{ opacity: isDragging ? 0.5 : 1, outline: isOver && !isDragging ? '2px dashed #3b82f6' : undefined }}
        draggable={draggable && !groupBySeverity}
        onDragStart={draggable && !groupBySeverity ? e => handleDragStart(e, idx) : undefined}
        onDragOver={draggable && !groupBySeverity ? e => handleDragOver(e, idx) : undefined}
        onDrop={draggable && !groupBySeverity ? e => handleDrop(e, idx) : undefined}
        onDragEnd={draggable && !groupBySeverity ? handleDragEnd : undefined}
      >
        <div className="patient-card-inner">
          {!groupBySeverity && (
            <span className="drag-handle" title="Drag to reorder">⠿</span>
          )}
          <div className="patient-info">
            <div className="patient-name">
              {patient.patientName || 'Unnamed Patient'}
              &nbsp;
              <span className={`severity-badge severity-${sev.cls}`}>
                {sev.emoji} {sev.label}
              </span>
            </div>
            <div className="patient-meta">
              {[patient.room && `Room ${patient.room}`, patient.patientAge && `${patient.patientAge} y/o`, patient.diagnosis]
                .filter(Boolean).join(' · ')}
            </div>
          </div>
          <div className="patient-actions">
            {!groupBySeverity && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => moveUp(idx)}   title="Move up"   disabled={idx === 0}>↑</button>
                <button className="btn btn-ghost btn-sm" onClick={() => moveDown(idx)} title="Move down" disabled={idx === patients.length - 1}>↓</button>
              </>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => onEdit(patient.id)}>✏️ Edit</button>
            <button className="btn btn-danger  btn-sm" onClick={() => { if (window.confirm(`Remove ${patient.patientName || 'this patient'}?`)) onDelete(patient.id) }}>🗑️</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={onAdd}>＋ Add Patient</button>
        <span className="spacer" />
        <button
          className={`btn ${groupBySeverity ? 'btn-warning' : 'btn-ghost'}`}
          onClick={() => setGroupBySeverity(g => !g)}
          title="Group patients by illness severity"
        >
          {groupBySeverity ? '🔴🟡🟢 Grouped by Severity' : '☰ Group by Severity'}
        </button>
      </div>

      {groupBySeverity ? (
        <div>
          {SEVERITY_ORDER.map(sev => {
            const group = patients.filter(p => p.illnessSeverity === sev)
            if (group.length === 0) return null
            const info = SEVERITY_LABEL[sev]
            return (
              <div className="severity-group" key={sev}>
                <div className={`severity-group-header ${info.cls}`}>
                  <span style={{ fontSize: '1.1rem' }}>{info.emoji}</span>
                  <h3>{info.label} ({group.length})</h3>
                </div>
                <div className="patient-list">
                  {group.map((p, localIdx) => {
                    const globalIdx = patients.indexOf(p)
                    return renderPatientCard(p, globalIdx, false)
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="patient-list">
          {patients.map((p, idx) => renderPatientCard(p, idx, true))}
        </div>
      )}

      <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.78rem', marginTop: '0.75rem' }}>
        {patients.length} patient{patients.length !== 1 ? 's' : ''} · Drag rows or use ↑↓ to reorder
      </p>
    </div>
  )
}
