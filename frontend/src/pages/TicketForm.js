import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TicketForm() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('open');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if ((user.role === 'agent' || user.role === 'admin')) {
      fetch('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setUsers(data.filter(u => u.isActive)))
        .catch(() => {});
    }
    if (id) {
      fetch(`/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          setTitle(data.title);
          setDescription(data.description);
          setPriority(data.priority);
          setStatus(data.status);
          setAssignedTo(data.assignedTo?._id || '');
        });
    }
  }, [id, user.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/tickets/${id}` : '/api/tickets';
      const body = { title, description, priority };
      if (user.role !== 'user') {
        body.status = status;
        body.assignedTo = assignedTo || undefined;
      }
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Save failed');
      navigate('/tickets');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '30px auto' }}>
      <h2>{id ? 'Edit Ticket' : 'Create Ticket'}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required /><br/>
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required /><br/>
        <select value={priority} onChange={e => setPriority(e.target.value)} required>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select><br/>
        {user.role !== 'user' && (
          <>
            <select value={status} onChange={e => setStatus(e.target.value)} required>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select><br/>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select><br/>
          </>
        )}
        <button type="submit">{id ? 'Update' : 'Create'}</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
} 