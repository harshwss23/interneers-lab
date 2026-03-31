import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    date_joined: string;
}

export default function AdminDashboard() {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/accounts/users/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            const json = await res.json();
            setUsers(json.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            const res = await fetch(`http://localhost:8000/api/accounts/users/${userId}/`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            }
        } catch (err) {
            alert('Failed to update user status');
        }
    };

    const changeUserRole = async (userId: number, newRole: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/accounts/users/${userId}/`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (err) {
            alert('Failed to update user role');
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#0f172a', marginBottom: '2rem' }}>Admin Dashboard</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Total Users</p>
                    <h2 style={{ margin: '0.5rem 0 0 0', color: '#1e293b' }}>{users.length}</h2>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Active Managers</p>
                    <h2 style={{ margin: '0.5rem 0 0 0', color: '#1e293b' }}>{users.filter(u => u.role === 'WAREHOUSE_MANAGER' && u.status === 'ACTIVE').length}</h2>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>User Management</h3>
                    {error && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</span>}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>User</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Role</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.username}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <select 
                                        value={u.role} 
                                        onChange={(e) => changeUserRole(u.id, e.target.value)}
                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        padding: '0.25rem 0.5rem', 
                                        borderRadius: '4px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600,
                                        backgroundColor: u.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                                        color: u.status === 'ACTIVE' ? '#059669' : '#dc2626'
                                    }}>
                                        {u.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button 
                                        onClick={() => toggleUserStatus(u.id, u.status)}
                                        style={{ 
                                            padding: '0.4rem 0.8rem', 
                                            borderRadius: '6px', 
                                            border: '1px solid #cbd5e1', 
                                            backgroundColor: 'white', 
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            color: u.status === 'ACTIVE' ? '#dc2626' : '#059669',
                                            fontWeight: 600
                                        }}
                                    >
                                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
