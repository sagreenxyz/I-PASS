import { useState, useCallback } from 'react'
import PatientList from './components/PatientList.jsx'
import PatientForm from './components/PatientForm.jsx'
import ReadOff from './components/ReadOff.jsx'

const VIEWS = { LIST: 'list', FORM: 'form', READOFF: 'readoff' }

export default function App() {
  const [view, setView] = useState(VIEWS.LIST)
  const [patients, setPatients] = useState([])
  const [editingId, setEditingId] = useState(null)

  const handleAddPatient = () => {
    setEditingId(null)
    setView(VIEWS.FORM)
  }

  const handleEditPatient = (id) => {
    setEditingId(id)
    setView(VIEWS.FORM)
  }

  const handleDeletePatient = (id) => {
    setPatients(prev => prev.filter(p => p.id !== id))
  }

  const handleSavePatient = useCallback((patient) => {
    setPatients(prev => {
      const exists = prev.find(p => p.id === patient.id)
      if (exists) {
        return prev.map(p => p.id === patient.id ? patient : p)
      }
      return [...prev, patient]
    })
    setView(VIEWS.LIST)
    setEditingId(null)
  }, [])

  const handleReorder = useCallback((newOrder) => {
    setPatients(newOrder)
  }, [])

  const handleCancel = () => {
    setView(VIEWS.LIST)
    setEditingId(null)
  }

  const editingPatient = editingId ? patients.find(p => p.id === editingId) : null

  return (
    <div>
      <header className="app-header">
        <div className="header-logo">IP</div>
        <div>
          <h1>I-PASS Handoff</h1>
          <div className="subtitle">Nurse Shift Handoff Documentation</div>
        </div>
      </header>

      <main className="main-content">
        {view === VIEWS.FORM ? (
          <PatientForm
            patient={editingPatient}
            onSave={handleSavePatient}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <div className="view-tabs">
              <button
                className={`view-tab ${view === VIEWS.LIST ? 'active' : ''}`}
                onClick={() => setView(VIEWS.LIST)}
              >
                📋 Patient List
              </button>
              <button
                className={`view-tab ${view === VIEWS.READOFF ? 'active' : ''}`}
                onClick={() => patients.length > 0 && setView(VIEWS.READOFF)}
                disabled={patients.length === 0}
                title={patients.length === 0 ? 'Add patients first' : 'Start read-off'}
              >
                🎙️ Read-Off
              </button>
            </div>

            {view === VIEWS.LIST && (
              <PatientList
                patients={patients}
                onAdd={handleAddPatient}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
                onReorder={handleReorder}
              />
            )}

            {view === VIEWS.READOFF && (
              <ReadOff
                patients={patients}
                onClose={() => setView(VIEWS.LIST)}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
