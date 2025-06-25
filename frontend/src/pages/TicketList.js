import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, search, status, priority });
      const res = await fetch(`/api/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch tickets');
      setTickets(data.tickets);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, [page, search, status, priority]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '30px auto' }}>
      <h2>Tickets</h2>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => navigate('/tickets/new')}>Create Ticket</button>
        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginLeft: 10 }} />
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ marginLeft: 10 }}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)} style={{ marginLeft: 10 }}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <table border="1" cellPadding="6" style={{ width: '100%', background: '#fff' }}>
          <thead>
            <tr>
              <th>Title</th><th>Status</th><th>Priority</th><th>Created By</th><th>Assigned To</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t._id}>
                <td>{t.title}</td>
                <td>{t.status}</td>
                <td>{t.priority}</td>
                <td>{t.createdBy?.name || ''}</td>
                <td>{t.assignedTo?.name || ''}</td>
                <td>
                  <button onClick={() => navigate(`/tickets/${t._id}`)}>View/Edit</button>
                  {(user.role !== 'user' || t.createdBy?._id === user.id) && (
                    <button onClick={() => handleDelete(t._id)} style={{ marginLeft: 5 }}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 10 }}>
        Page: <b>{page}</b> / {Math.ceil(total / 10) || 1}
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ marginLeft: 10 }}>Prev</button>
        <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total} style={{ marginLeft: 5 }}>Next</button>
      </div>
    </div>
  );
} 