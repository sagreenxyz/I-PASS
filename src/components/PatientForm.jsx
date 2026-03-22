import { useState } from 'react'

const SEVERITY_OPTIONS = [
  { value: 'stable',   label: '🟢 Stable',   hint: 'Patient is clinically stable; no immediate concerns.' },
  { value: 'watcher',  label: '🟡 Watcher',  hint: 'Patient requires close monitoring; potential to deteriorate.' },
  { value: 'unstable', label: '🔴 Unstable', hint: 'Patient is critically ill or actively deteriorating.' },
]

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function blankPatient() {
  return {
    id: genId(),
    /* I */
    illnessSeverity: 'stable',
    /* P */
    patientName: '',
    patientAge: '',
    room: '',
    diagnosis: '',
    hospitalDay: '',
    summary: '',
    /* A */
    actions: [],
    /* S1 */
    situationAwareness: '',
    contingencyPlans: [],
    /* S2 */
    synthesisNotes: '',
  }
}

function blankAction() { return { id: genId(), task: '', owner: '', timing: '', done: false } }
function blankContingency() { return { id: genId(), condition: '', action: '' } }

export default function PatientForm({ patient, onSave, onCancel }) {
  const [form, setForm] = useState(patient ? { ...patient } : blankPatient())

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  /* ── Actions ── */
  const addAction = () => setForm(prev => ({ ...prev, actions: [...prev.actions, blankAction()] }))
  const updateAction = (id, field, value) =>
    setForm(prev => ({ ...prev, actions: prev.actions.map(a => a.id === id ? { ...a, [field]: value } : a) }))
  const removeAction = (id) =>
    setForm(prev => ({ ...prev, actions: prev.actions.filter(a => a.id !== id) }))

  /* ── Contingencies ── */
  const addContingency = () => setForm(prev => ({ ...prev, contingencyPlans: [...prev.contingencyPlans, blankContingency()] }))
  const updateContingency = (id, field, value) =>
    setForm(prev => ({ ...prev, contingencyPlans: prev.contingencyPlans.map(c => c.id === id ? { ...c, [field]: value } : c) }))
  const removeContingency = (id) =>
    setForm(prev => ({ ...prev, contingencyPlans: prev.contingencyPlans.filter(c => c.id !== id) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.patientName.trim()) {
      alert('Please enter the patient name or identifier.')
      return
    }
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card-header" style={{ background: 'white', borderRadius: '12px 12px 0 0', border: '1px solid #e5e7eb', borderBottom: 'none' }}>
        <strong>{patient ? `Editing: ${patient.patientName || 'Patient'}` : 'New Patient Handoff'}</strong>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-success">💾 Save Patient</button>
        </div>
      </div>

      {/* ── I: Illness Severity ── */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-letter">I</div>
          <div>
            <div className="form-section-title">Illness Severity</div>
            <div className="form-section-hint">
              Overall assessment of how sick this patient is right now. This sets the urgency tone for the entire handoff.
            </div>
          </div>
        </div>
        <div className="form-section-body">
          <div className="form-group">
            <label className="form-label">Severity Level *</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {SEVERITY_OPTIONS.map(opt => (
                <label key={opt.value} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
                  padding: '0.6rem 0.9rem', borderRadius: '8px', cursor: 'pointer',
                  border: `2px solid ${form.illnessSeverity === opt.value ? '#2563eb' : '#d1d5db'}`,
                  background: form.illnessSeverity === opt.value ? '#eff6ff' : 'white',
                  transition: 'all 0.15s', flex: '1', minWidth: '140px'
                }}>
                  <input
                    type="radio"
                    name="severity"
                    value={opt.value}
                    checked={form.illnessSeverity === opt.value}
                    onChange={() => set('illnessSeverity', opt.value)}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.73rem', color: '#6b7280', marginTop: '0.1rem' }}>{opt.hint}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── P: Patient Summary ── */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-letter">P</div>
          <div>
            <div className="form-section-title">Patient Summary</div>
            <div className="form-section-hint">
              Provide a concise overview: who the patient is, why they're here, and what has happened during this shift. Include diagnosis, hospital day, and relevant history.
            </div>
          </div>
        </div>
        <div className="form-section-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Patient Name / ID *</label>
              <div className="form-hint">Use initials or ID per your facility's privacy policy.</div>
              <input
                type="text"
                placeholder="e.g. J. Smith or Bed 4B"
                value={form.patientName}
                onChange={e => set('patientName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="text"
                placeholder="e.g. 68"
                value={form.patientAge}
                onChange={e => set('patientAge', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Room / Bed</label>
              <input
                type="text"
                placeholder="e.g. 312A"
                value={form.room}
                onChange={e => set('room', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital Day</label>
              <div className="form-hint">Day # of this admission.</div>
              <input
                type="text"
                placeholder="e.g. 3"
                value={form.hospitalDay}
                onChange={e => set('hospitalDay', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Primary Diagnosis / Chief Complaint</label>
            <div className="form-hint">The main reason for admission or the current working diagnosis.</div>
            <input
              type="text"
              placeholder="e.g. COPD exacerbation, CHF decompensation"
              value={form.diagnosis}
              onChange={e => set('diagnosis', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Patient Summary</label>
            <div className="form-hint">
              Describe the hospital course, current clinical status, active problems, medications of note, and ongoing plan. Write as you would say it aloud during handoff.
            </div>
            <textarea
              rows={5}
              placeholder={`Example:\n68 y/o M admitted HD3 for COPD exacerbation. Started on prednisone and nebulizers q4h. Sats improved from 82% to 96% on 2L NC. Chest X-ray today showed improvement. Plan: wean O2, pulmonology consult pending.`}
              value={form.summary}
              onChange={e => set('summary', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── A: Actions ── */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-letter">A</div>
          <div>
            <div className="form-section-title">Action List</div>
            <div className="form-section-hint">
              List all pending tasks, follow-ups, or to-dos the oncoming nurse needs to act on. Be specific: what, who, and when.
            </div>
          </div>
        </div>
        <div className="form-section-body">
          {form.actions.length === 0 && (
            <p className="text-muted" style={{ fontSize: '0.82rem' }}>No actions added yet. Click below to add a pending task.</p>
          )}
          {form.actions.map(action => (
            <div className="action-item" key={action.id}>
              <input
                type="text"
                placeholder="Task (e.g. Re-check INR at 18:00)"
                value={action.task}
                onChange={e => updateAction(action.id, 'task', e.target.value)}
              />
              <input
                type="text"
                placeholder="Owner (e.g. RN, MD)"
                value={action.owner}
                onChange={e => updateAction(action.id, 'owner', e.target.value)}
                style={{ maxWidth: '110px' }}
              />
              <input
                type="text"
                placeholder="Timing"
                value={action.timing}
                onChange={e => updateAction(action.id, 'timing', e.target.value)}
                style={{ maxWidth: '90px' }}
              />
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeAction(action.id)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addAction}>＋ Add Action</button>
        </div>
      </div>

      {/* ── S1: Situation Awareness & Contingency ── */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-letter">S</div>
          <div>
            <div className="form-section-title">Situation Awareness &amp; Contingency Plans</div>
            <div className="form-section-hint">
              What are you worried about? Describe your "big picture" concerns and specific "if-then" plans so the oncoming nurse knows what to watch for and what to do.
            </div>
          </div>
        </div>
        <div className="form-section-body">
          <div className="form-group">
            <label className="form-label">Situation Awareness</label>
            <div className="form-hint">Describe overall clinical trajectory. Are things improving, stable, or concerning?</div>
            <textarea
              rows={3}
              placeholder="e.g. Patient trending in the right direction but still at risk for overnight decompensation given poor baseline."
              value={form.situationAwareness}
              onChange={e => set('situationAwareness', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contingency Plans (If → Then)</label>
            <div className="form-hint">Add specific scenarios and the expected response. E.g. "If O₂ sats drop below 90% → increase to 4L and call MD."</div>
          </div>
          {form.contingencyPlans.length === 0 && (
            <p className="text-muted" style={{ fontSize: '0.82rem' }}>No contingency plans yet. Add an "if/then" scenario below.</p>
          )}
          {form.contingencyPlans.map(cp => (
            <div className="contingency-item" key={cp.id}>
              <input
                type="text"
                placeholder="If... (condition)"
                value={cp.condition}
                onChange={e => updateContingency(cp.id, 'condition', e.target.value)}
              />
              <input
                type="text"
                placeholder="Then... (action)"
                value={cp.action}
                onChange={e => updateContingency(cp.id, 'action', e.target.value)}
              />
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeContingency(cp.id)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addContingency}>＋ Add Contingency Plan</button>
        </div>
      </div>

      {/* ── S2: Synthesis ── */}
      <div className="form-section">
        <div className="form-section-header">
          <div className="form-section-letter" style={{ background: '#7c3aed' }}>S</div>
          <div>
            <div className="form-section-title">Synthesis by Receiver</div>
            <div className="form-section-hint">
              Space for the receiving nurse to confirm understanding, ask questions, or note their own read-back summary. During handoff, verbally confirm key points with the oncoming nurse.
            </div>
          </div>
        </div>
        <div className="form-section-body">
          <div className="form-group">
            <label className="form-label">Receiver Notes / Questions</label>
            <div className="form-hint">Leave blank if not yet completed. The oncoming nurse can fill this in during or after the handoff conversation.</div>
            <textarea
              rows={3}
              placeholder="e.g. Confirmed: will check INR at 18:00 and call physician if > 3.5. Aware patient may desat overnight."
              value={form.synthesisNotes}
              onChange={e => set('synthesisNotes', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-success">💾 Save Patient</button>
      </div>
    </form>
  )
}
