import { useState } from 'react'

const SEVERITY_LABEL = {
  stable:   { label: 'Stable',   emoji: '🟢', cls: 'stable'   },
  watcher:  { label: 'Watcher',  emoji: '🟡', cls: 'watcher'  },
  unstable: { label: 'Unstable', emoji: '🔴', cls: 'unstable' },
}

const SECTION_DEFS = [
  {
    key: 'I',
    label: 'Illness Severity',
    color: '#2563eb',
    render: (p) => {
      const sev = SEVERITY_LABEL[p.illnessSeverity] || SEVERITY_LABEL.stable
      return (
        <span className={`severity-badge severity-${sev.cls}`} style={{ fontSize: '0.875rem' }}>
          {sev.emoji} {sev.label}
        </span>
      )
    },
  },
  {
    key: 'P',
    label: 'Patient Summary',
    color: '#2563eb',
    render: (p) => (
      <div>
        {p.diagnosis && <div style={{ marginBottom: '0.3rem', fontWeight: 600 }}>{p.diagnosis}</div>}
        {p.summary ? (
          <p className="readoff-text">{p.summary}</p>
        ) : (
          <em className="text-muted">No summary provided.</em>
        )}
      </div>
    ),
  },
  {
    key: 'A',
    label: 'Action List',
    color: '#2563eb',
    render: (p) => {
      if (!p.actions || p.actions.length === 0) {
        return <em className="text-muted">No pending actions.</em>
      }
      return (
        <ul className="readoff-list">
          {p.actions.map(a => (
            <li key={a.id} className={a.done ? 'done' : ''}>
              <strong>{a.task}</strong>
              {a.owner  && <span className="text-muted"> · {a.owner}</span>}
              {a.timing && <span className="text-muted"> · {a.timing}</span>}
            </li>
          ))}
        </ul>
      )
    },
  },
  {
    key: 'S',
    label: 'Situation Awareness & Contingency',
    color: '#2563eb',
    render: (p) => (
      <div>
        {p.situationAwareness && <p className="readoff-text" style={{ marginBottom: '0.5rem' }}>{p.situationAwareness}</p>}
        {p.contingencyPlans && p.contingencyPlans.length > 0 && (
          <ul className="readoff-list">
            {p.contingencyPlans.map(cp => (
              <li key={cp.id}>
                <strong>If</strong> {cp.condition} → <strong>Then</strong> {cp.action}
              </li>
            ))}
          </ul>
        )}
        {!p.situationAwareness && (!p.contingencyPlans || p.contingencyPlans.length === 0) && (
          <em className="text-muted">No situation awareness notes.</em>
        )}
      </div>
    ),
  },
  {
    key: 'S₂',
    label: 'Synthesis',
    color: '#7c3aed',
    render: (p) => (
      p.synthesisNotes
        ? <p className="readoff-text">{p.synthesisNotes}</p>
        : <em className="text-muted">Awaiting receiver synthesis.</em>
    ),
  },
]

export default function ReadOff({ patients, onClose }) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (patients.length === 0) return null

  const activePatient = patients[activeIdx]
  const sev = SEVERITY_LABEL[activePatient?.illnessSeverity] || SEVERITY_LABEL.stable

  return (
    <div>
      <div className="toolbar">
        <strong style={{ fontSize: '1rem' }}>🎙️ Read-Off Mode</strong>
        <span className="text-muted" style={{ fontSize: '0.82rem', marginLeft: '0.5rem' }}>
          Read through each patient sequentially. Click a patient to jump to them.
        </span>
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={onClose}>✕ Exit Read-Off</button>
      </div>

      {/* Quick-jump patient tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {patients.map((p, idx) => {
          const s = SEVERITY_LABEL[p.illnessSeverity] || SEVERITY_LABEL.stable
          return (
            <button
              key={p.id}
              onClick={() => setActiveIdx(idx)}
              className="btn btn-ghost btn-sm"
              style={{
                borderColor: idx === activeIdx ? '#2563eb' : undefined,
                background: idx === activeIdx ? '#eff6ff' : undefined,
                color: idx === activeIdx ? '#1e40af' : undefined,
              }}
            >
              {s.emoji} {p.patientName || `Patient ${idx + 1}`}
            </button>
          )
        })}
      </div>

      {/* Active patient full I-PASS read-out */}
      <div className="card">
        <div className="card-header" style={{ background: '#f0f4f8' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              {activePatient.patientName || `Patient ${activeIdx + 1}`}
            </div>
            <div className="patient-meta">
              {[
                activePatient.room && `Room ${activePatient.room}`,
                activePatient.patientAge && `${activePatient.patientAge} y/o`,
                `HD ${activePatient.hospitalDay || '?'}`,
              ].filter(Boolean).join(' · ')}
            </div>
          </div>
          <span className={`severity-badge severity-${sev.cls}`} style={{ fontSize: '0.85rem' }}>
            {sev.emoji} {sev.label}
          </span>
        </div>
        <div className="readoff-body">
          {SECTION_DEFS.map(section => (
            <div className="readoff-section" key={section.key}>
              <div className="readoff-section-label">
                <span className="readoff-letter" style={{ background: section.color }}>{section.key}</span>
                {section.label}
              </div>
              {section.render(activePatient)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="readoff-nav">
        <button
          className="btn btn-ghost"
          onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
          disabled={activeIdx === 0}
        >
          ← Previous
        </button>
        <span className="readoff-progress">
          Patient {activeIdx + 1} of {patients.length}
        </span>
        <button
          className="btn btn-primary"
          onClick={() => setActiveIdx(i => Math.min(patients.length - 1, i + 1))}
          disabled={activeIdx === patients.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
