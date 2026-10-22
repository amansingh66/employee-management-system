import { useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:8080/api/employees'

function App() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    salary: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadEmployees() {
    try {
      const response = await fetch(API)
      if (!response.ok) throw new Error('Could not load employees')
      const data = await response.json()
      setEmployees(data)
      setMessage('')
    } catch (error) {
      setMessage('Could not connect to the backend. Check that Spring Boot is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const employee = {
      ...form,
      salary: Number(form.salary),
    }

    try {
      const url = editingId ? `${API}/${editingId}` : API
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      })

      if (!response.ok) throw new Error('Save failed')

      setMessage(editingId ? 'Employee updated successfully!' : 'Employee added successfully!')
      setForm({ name: '', email: '', department: '', salary: '' })
      setEditingId(null)
      await loadEmployees()
    } catch (error) {
      setMessage('Unable to save employee. Check the backend and API endpoints.')
    }
  }

  function editEmployee(employee) {
    setForm({
      name: employee.name ?? '',
      email: employee.email ?? '',
      department: employee.department ?? '',
      salary: employee.salary ?? '',
    })
    setEditingId(employee.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteEmployee(id) {
    if (!window.confirm('Are you sure you want to delete this employee?')) return

    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')
      setMessage('Employee deleted successfully!')
      await loadEmployees()
    } catch (error) {
      setMessage('Unable to delete employee.')
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ name: '', email: '', department: '', salary: '' })
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">E</div>
          <div>
            <h2>EmployeeHub</h2>
            <p>Employee Management System</p>
          </div>
        </div>
        <span className="status"><span /> Management Portal</span>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">WORKSPACE / EMPLOYEES</p>
          <h1>Employee Management</h1>
          <p className="subtitle">Manage your team, employee details, and departments in one place.</p>
        </div>
        <div className="welcome-mark">EM</div>
      </section>

      {message && <div className="message">{message}</div>}

      <section className="stats">
        <div className="stat-card">
          <span className="stat-icon purple">♙</span>
          <p>Total Employees</p>
          <h2>{employees.length}</h2>
        </div>
        <div className="stat-card">
          <span className="stat-icon green">▦</span>
          <p>Departments</p>
          <h2>{new Set(employees.map(e => e.department).filter(Boolean)).size}</h2>
        </div>
        <div className="stat-card">
          <span className="stat-icon orange">₹</span>
          <p>Total Monthly Salary</p>
          <h2>₹{employees.reduce((sum, e) => sum + Number(e.salary || 0), 0).toLocaleString('en-IN')}</h2>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
            <p>{editingId ? 'Update the employee information below.' : 'Enter the details to add a team member.'}</p>
          </div>
          {editingId && <button className="secondary-btn" onClick={cancelEdit}>Cancel edit</button>}
        </div>

        <form className="employee-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Aman Kumar" required />
          </label>
          <label>
            Email Address
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="aman@example.com" required />
          </label>
          <label>
            Department
            <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Engineering" required />
          </label>
          <label>
            Monthly Salary (₹)
            <input name="salary" type="number" min="0" value={form.salary} onChange={handleChange} placeholder="e.g. 45000" required />
          </label>
          <button className="primary-btn" type="submit">
            {editingId ? 'Save Changes' : '+ Add Employee'}
          </button>
        </form>
      </section>

      <section className="panel employee-panel">
        <div className="panel-heading">
          <div>
            <h2>Employee Directory</h2>
            <p>All employees stored in your database.</p>
          </div>
          <button className="secondary-btn" onClick={loadEmployees}>↻ Refresh</button>
        </div>

        {loading ? (
          <p className="empty">Loading employees...</p>
        ) : employees.length === 0 ? (
          <p className="empty">No employees found. Add your first employee above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Salary / Month</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee.id}>
                    <td>
                      <div className="person">
                        <div className="avatar">
                          {(employee.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{employee.name}</strong>
                          <small>{employee.email}</small>
                          <small>ID: {employee.id}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="department">{employee.department}</span></td>
                    <td className="salary">₹{Number(employee.salary || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div className="actions">
                        <button className="edit-btn" onClick={() => editEmployee(employee)}>Edit</button>
                        <button className="delete-btn" onClick={() => deleteEmployee(employee.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>EmployeeHub · Built with React, Spring Boot & MySQL</footer>
    </main>
  )
}

export default App