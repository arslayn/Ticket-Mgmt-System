import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TicketList from './pages/TicketList';
import TicketForm from './pages/TicketForm';
import UserManagement from './pages/UserManagement';

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  if (!token) return <Navigate to="/login" />;
  if (roles && (!user || !roles.includes(user.role))) return <Navigate to="/tickets" />;
  return children;
}

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };
  return user ? (
    <nav style={{ padding: 10, background: '#eee', marginBottom: 20 }}>
      <Link to="/tickets">Tickets</Link>
      {user.role === 'admin' && <Link to="/users" style={{ marginLeft: 10 }}>User Management</Link>}
      <span style={{ float: 'right' }}>
        {user.name} ({user.role}) <button onClick={logout}>Logout</button>
      </span>
    </nav>
  ) : null;
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tickets" element={<PrivateRoute><TicketList /></PrivateRoute>} />
        <Route path="/tickets/new" element={<PrivateRoute><TicketForm /></PrivateRoute>} />
        <Route path="/tickets/:id" element={<PrivateRoute><TicketForm /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/tickets" />} />
      </Routes>
    </Router>
  );
}
