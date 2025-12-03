import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types ---
type Role = 'admin' | 'user';

interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed!
  role: Role;
}

interface Session {
  user: User;
  loginTime: number;
}

// --- Icons (SVGs) ---
const Icons = {
  Wifi: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  )
};

// --- Initial Data ---
const INITIAL_ADMIN: User = {
  id: 'root-admin',
  username: 'joshy',
  password: 'dani5161',
  role: 'admin',
};

// --- Helper Functions ---
const generateId = () => {
  // Simple fallback ID generator
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    }
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem('cp_users');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Error loading users", e);
  }
  return [INITIAL_ADMIN];
};

const saveStoredUsers = (users: User[]) => {
  localStorage.setItem('cp_users', JSON.stringify(users));
};

// --- Styles ---
const Styles = () => (
  <style>{`
    :root {
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --bg: #f1f5f9;
      --surface: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --danger: #ef4444;
      --success: #22c55e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { 
      background-color: var(--bg); 
      color: var(--text-main); 
      min-height: 100vh; 
      display: flex; 
      flex-direction: column;
      background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
      background-size: 20px 20px;
    }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; width: 100%; }
    .card { background: var(--surface); border-radius: 16px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); padding: 2.5rem; border: 1px solid var(--border); }
    
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-size: 0.95rem;
    }
    .btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5); }
    .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.6); }
    .btn-danger { background: #fee2e2; color: var(--danger); }
    .btn-danger:hover { background: #fecaca; }
    .btn-ghost { background: transparent; color: var(--text-muted); }
    .btn-ghost:hover { background: #f1f5f9; color: var(--text-main); }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; border-radius: 8px; }

    .input-group { margin-bottom: 1.25rem; }
    .input-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 500; color: var(--text-muted); }
    .input { width: 100%; padding: 0.85rem 1rem; border-radius: 10px; border: 1px solid var(--border); font-size: 1rem; transition: all 0.2s; background: #f8fafc; }
    .input:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    
    .table-container { overflow-x: auto; margin-top: 1.5rem; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); }
    .table { width: 100%; border-collapse: collapse; text-align: left; }
    .table th { padding: 1rem 1.5rem; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; background: #f8fafc; }
    .table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover td { background: #f8fafc; }
    
    .badge { padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; }
    .badge-admin { background: #dbeafe; color: #1e40af; }
    .badge-user { background: #f1f5f9; color: #475569; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(4px); }
    .modal { background: var(--surface); width: 100%; max-width: 450px; border-radius: 16px; padding: 2.5rem; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); margin: 1rem; animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    
    @keyframes modalSlide { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; background: var(--surface); padding: 1rem 2rem; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border: 1px solid var(--border); }
    .logo { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 1.25rem; color: var(--primary); letter-spacing: -0.025em; }
  `}</style>
);

// --- Components ---

const LoginForm = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getStoredUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <Icons.Wifi />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Portal Cautivo</h1>
          <p style={{ color: 'var(--text-muted)' }}>Inicia sesión para acceder a la red</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>{error}</div>}
          
          <div className="input-group">
            <label>Usuario</label>
            <input 
              className="input" 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="Ej. joshy"
              autoFocus
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input 
              className="input" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}>
            Acceder a Internet
          </button>
        </form>
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Acceso seguro a Red Local v1.0
        </div>
      </div>
    </div>
  );
};

const UserWelcome = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '3.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Icons.CheckCircle />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', fontWeight: '800', letterSpacing: '-0.025em' }}>¡Conectado!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Bienvenido, <strong>{user.username}</strong>. Tienes acceso limitado.</p>
        
        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border)' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Tiempo de sesión</div>
          <div style={{ fontSize: '3.5rem', fontWeight: '700', color: 'var(--primary)', fontFamily: 'monospace', lineHeight: 1 }}>{formatTime(timer)}</div>
        </div>

        <button onClick={onLogout} className="btn btn-ghost">
          <Icons.LogOut /> Desconectar
        </button>
      </div>
    </div>
  );
};

interface UserModalProps {
  user?: User;
  onClose: () => void;
  onSave: (u: User) => void;
}

const UserModal = ({ user, onClose, onSave }: UserModalProps) => {
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState(user?.password || '');
  const [role, setRole] = useState<Role>(user?.role || 'user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    onSave({
      id: user?.id || generateId(),
      username,
      password,
      role
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre de Usuario</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Nombre único" />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input className="input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Contraseña segura" />
          </div>
          <div className="input-group">
            <label>Rol de Acceso</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', border: `1px solid ${role === 'user' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px', flex: 1, background: role === 'user' ? '#eff6ff' : 'white' }}>
                <input type="radio" checked={role === 'user'} onChange={() => setRole('user')} />
                Usuario
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', border: `1px solid ${role === 'admin' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px', flex: 1, background: role === 'admin' ? '#eff6ff' : 'white' }}>
                <input type="radio" checked={role === 'admin'} onChange={() => setRole('admin')} />
                Admin
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
            <button type="submit" className="btn btn-primary">{user ? 'Guardar Cambios' : 'Crear Usuario'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ currentUser, onLogout }: { currentUser: User, onLogout: () => void }) => {
  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  const handleCreate = (u: User) => {
    if (users.some(existing => existing.username === u.username)) {
      alert('El nombre de usuario ya existe');
      return;
    }
    setUsers([...users, u]);
    setIsModalOpen(false);
  };

  const handleEdit = (u: User) => {
    setUsers(users.map(existing => existing.id === u.id ? u : existing));
    setIsModalOpen(false);
    setEditingUser(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const openCreateModal = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setIsModalOpen(true);
  };

  return (
    <div className="container">
      <div className="header fade-in">
        <div className="logo">
          <div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
            <Icons.Wifi />
          </div>
          <span>Panel de Administración</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hola, <strong>{currentUser.username}</strong></span>
          <button onClick={onLogout} className="btn btn-ghost btn-sm">
            <Icons.LogOut /> Salir
          </button>
        </div>
      </div>

      <div className="card fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>Gestión de Usuarios</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Administra el acceso a la red local.</p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            <Icons.Plus /> Nuevo Usuario
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Contraseña</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                        <Icons.User />
                      </div>
                      <span style={{ fontWeight: '600' }}>{user.username}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{user.password}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(user)} className="btn btn-ghost btn-sm" title="Editar">
                        <Icons.Edit />
                      </button>
                      {user.username !== 'joshy' && user.id !== currentUser.id && (
                        <button onClick={() => handleDelete(user.id)} className="btn btn-danger btn-sm" title="Eliminar">
                          <Icons.Trash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay usuarios registrados</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={() => setIsModalOpen(false)} 
          onSave={editingUser ? handleEdit : handleCreate} 
        />
      )}
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [session, setSession] = useState<Session | null>(null);

  // Initialize DB on mount
  useEffect(() => {
    const existing = localStorage.getItem('cp_users');
    if (!existing) {
      saveStoredUsers([INITIAL_ADMIN]);
    }
    
    // Check for active session
    const storedSession = localStorage.getItem('cp_session');
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    }
  }, []);

  const handleLogin = (user: User) => {
    const newSession = { user, loginTime: Date.now() };
    setSession(newSession);
    localStorage.setItem('cp_session', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('cp_session');
  };

  return (
    <>
      <Styles />
      {!session ? (
        <LoginForm onLogin={handleLogin} />
      ) : session.user.role === 'admin' ? (
        <AdminDashboard currentUser={session.user} onLogout={handleLogout} />
      ) : (
        <UserWelcome user={session.user} onLogout={handleLogout} />
      )}
    </>
  );
};

// Robust mounting
const mount = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  } else {
    // Retry or auto-create if missing (failsafe for some environments)
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    createRoot(newRoot).render(<App />);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}