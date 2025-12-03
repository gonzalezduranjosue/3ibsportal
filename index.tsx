import React, { useState, useEffect, useRef } from 'react';
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
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
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
      /* Bronze/Earth Tone Palette */
      --primary: #9d7041; 
      --primary-gradient: linear-gradient(135deg, #b08050 0%, #8a5e30 100%);
      --primary-hover: #7d5329;
      --primary-light: #f4eadd;
      
      --bg: #f5f2eb; /* Warm beige background */
      --surface: #ffffff;
      
      --text-main: #4a3b32; /* Dark coffee */
      --text-muted: #8d7f71; /* Taupe */
      
      --border: #e6dfd5;
      
      --danger: #d04d4d;
      --success: #558b5e;
      
      --shadow-sm: 0 2px 4px rgba(74, 59, 50, 0.05);
      --shadow-md: 0 8px 16px rgba(74, 59, 50, 0.08);
      --shadow-lg: 0 16px 32px rgba(74, 59, 50, 0.12);
    }
    
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
    }
    
    body { 
      background-color: var(--bg); 
      color: var(--text-main); 
      min-height: 100vh; 
      display: flex; 
      flex-direction: column;
      background-image: radial-gradient(#d6ccc2 1px, transparent 1px);
      background-size: 24px 24px;
    }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; width: 100%; }
    
    .card { 
      background: var(--surface); 
      border-radius: 20px; 
      box-shadow: var(--shadow-md); 
      padding: 2.5rem; 
      border: 1px solid var(--border);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      box-shadow: var(--shadow-lg);
    }
    
    /* Buttons */
    .btn {
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      gap: 0.5rem;
      padding: 0.85rem 1.75rem; 
      border-radius: 12px; 
      font-weight: 600; 
      cursor: pointer; 
      border: none; 
      font-size: 0.95rem;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
    }
    
    .btn:active { transform: scale(0.96); }
    
    .btn-primary { 
      background: var(--primary-gradient); 
      color: white; 
      box-shadow: 0 4px 12px rgba(157, 112, 65, 0.3);
    }
    .btn-primary:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 16px rgba(157, 112, 65, 0.4); 
    }
    
    .btn-danger { background: #ffebeb; color: var(--danger); }
    .btn-danger:hover { background: #fee2e2; transform: translateY(-1px); }
    
    .btn-ghost { background: transparent; color: var(--text-muted); }
    .btn-ghost:hover { background: #f0ebe4; color: var(--text-main); transform: translateY(-1px); }
    
    .btn-outline { background: white; color: var(--text-main); border: 1px solid var(--border); }
    .btn-outline:hover { background: #fcfbf9; border-color: var(--primary); transform: translateY(-1px); }
    
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: 10px; }

    /* Inputs */
    .input-group { margin-bottom: 1.5rem; }
    .input-group label { 
      display: block; 
      margin-bottom: 0.6rem; 
      font-size: 0.9rem; 
      font-weight: 600; 
      color: var(--text-muted);
      transition: color 0.2s;
    }
    .input { 
      width: 100%; 
      padding: 1rem 1.25rem; 
      border-radius: 12px; 
      border: 2px solid transparent; 
      background: #f0ebe4; 
      font-size: 1rem; 
      transition: all 0.3s ease; 
      color: var(--text-main);
    }
    .input:hover {
      background: #e8e1d9;
    }
    .input:focus { 
      outline: none; 
      background: white; 
      border-color: var(--primary); 
      box-shadow: 0 4px 12px rgba(157, 112, 65, 0.15);
      transform: translateY(-2px);
    }
    .input-group:focus-within label {
      color: var(--primary);
    }
    
    /* Table */
    .table-container { 
      overflow-x: auto; 
      margin-top: 1.5rem; 
      border-radius: 16px; 
      border: 1px solid var(--border); 
      background: var(--surface); 
      box-shadow: var(--shadow-sm);
    }
    .table { width: 100%; border-collapse: collapse; text-align: left; }
    .table th { 
      padding: 1.25rem 1.5rem; 
      font-weight: 600; 
      color: var(--text-muted); 
      border-bottom: 1px solid var(--border); 
      font-size: 0.85rem; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
      background: #faf8f5; 
    }
    .table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover td { background: #faf8f5; transition: background 0.2s; }
    
    /* Badges */
    .badge { padding: 0.4rem 0.85rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.03em; }
    .badge-admin { background: #e0d0c1; color: #6d4c2d; }
    .badge-user { background: #f0ebe4; color: #8d7f71; }

    /* Modal */
    .modal-overlay { 
      position: fixed; inset: 0; background: rgba(74, 59, 50, 0.3); 
      display: flex; align-items: center; justify-content: center; 
      z-index: 50; backdrop-filter: blur(6px); 
      animation: fadeIn 0.3s ease;
    }
    .modal { 
      background: var(--surface); 
      width: 100%; max-width: 480px; 
      border-radius: 24px; padding: 3rem; 
      box-shadow: 0 25px 50px -12px rgba(74, 59, 50, 0.25); 
      margin: 1rem; 
      animation: modalSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
    }
    
    @keyframes modalSlide { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

    /* Layout specific */
    .header { 
      display: flex; align-items: center; justify-content: space-between; 
      margin-bottom: 2.5rem; background: var(--surface); padding: 1.25rem 2rem; 
      border-radius: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); 
    }
    .logo { 
      display: flex; align-items: center; gap: 0.85rem; 
      font-weight: 800; font-size: 1.35rem; color: var(--primary); letter-spacing: -0.02em; 
    }
    
    .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem; }
    .tool-card { 
      background: white; padding: 1.75rem; border-radius: 16px; 
      border: 1px solid var(--border); display: flex; flex-direction: column; gap: 1.25rem; 
      transition: all 0.3s ease;
    }
    .tool-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--primary); }
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
      <div className="card fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <Icons.Wifi />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.025em', color: 'var(--text-main)' }}>Portal Cautivo</h1>
          <p style={{ color: 'var(--text-muted)' }}>Inicia sesión para acceder a la red</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: '#ffebeb', color: '#c53030', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '600' }}>{error}</div>}
          
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1.1rem' }}>
            Acceder a Internet
          </button>
        </form>
        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.7 }}>
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
      <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '4rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', transform: 'scale(1.2)' }}>
          <Icons.CheckCircle />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', fontWeight: '800', letterSpacing: '-0.025em' }}>¡Conectado!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.15rem' }}>Bienvenido, <strong>{user.username}</strong>. Tienes acceso limitado.</p>
        
        <div style={{ background: '#fcfbf9', padding: '2.5rem', borderRadius: '24px', marginBottom: '3rem', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '1rem' }}>Tiempo de sesión</div>
          <div style={{ fontSize: '4rem', fontWeight: '700', color: 'var(--primary)', fontFamily: 'monospace', lineHeight: 1 }}>{formatTime(timer)}</div>
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
        <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
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
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', border: `2px solid ${role === 'user' ? 'var(--primary)' : 'transparent'}`, borderRadius: '12px', flex: 1, background: role === 'user' ? 'var(--primary-light)' : '#f0ebe4', transition: 'all 0.2s', fontWeight: '600', color: role === 'user' ? 'var(--primary)' : 'var(--text-muted)' }}>
                <input type="radio" checked={role === 'user'} onChange={() => setRole('user')} style={{accentColor: 'var(--primary)'}} />
                Usuario
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', border: `2px solid ${role === 'admin' ? 'var(--primary)' : 'transparent'}`, borderRadius: '12px', flex: 1, background: role === 'admin' ? 'var(--primary-light)' : '#f0ebe4', transition: 'all 0.2s', fontWeight: '600', color: role === 'admin' ? 'var(--primary)' : 'var(--text-muted)' }}>
                <input type="radio" checked={role === 'admin'} onChange={() => setRole('admin')} style={{accentColor: 'var(--primary)'}} />
                Admin
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem' }}>
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // --- Sync Logic ---
  const handleExport = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cp_usuarios_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].username) {
           if (confirm(`Se cargarán ${parsed.length} usuarios. Esto reemplazará la lista actual. ¿Continuar?`)) {
             setUsers(parsed);
             alert('¡Base de datos sincronizada correctamente!');
           }
        } else {
          alert('El archivo no tiene el formato de base de datos correcto.');
        }
      } catch (err) {
        console.error(err);
        alert('Error al leer el archivo. Asegúrate de que es un JSON válido.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="container">
      <div className="header fade-in">
        <div className="logo">
          <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: '12px', display: 'flex', color: 'var(--primary)' }}>
            <Icons.Wifi />
          </div>
          <span>Panel de Administración</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Hola, <strong>{currentUser.username}</strong></span>
          <button onClick={onLogout} className="btn btn-ghost btn-sm">
            <Icons.LogOut /> Salir
          </button>
        </div>
      </div>

      <div className="fade-in">
        {/* Sync Tools Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-main)' }}>Sincronización Manual</h3>
          <div className="tools-grid">
            <div className="tool-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>
                <Icons.Download /> Exportar Datos
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>Descarga la lista actual de usuarios. Envía este archivo a otros dispositivos para sincronizar.</p>
              <button onClick={handleExport} className="btn btn-outline btn-sm">Descargar Base de Datos</button>
            </div>
            
            <div className="tool-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)', fontWeight: '700' }}>
                <Icons.Upload /> Importar Datos
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>Carga un archivo de base de datos para actualizar la lista de usuarios en este dispositivo.</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".json" 
                onChange={handleImportFile}
              />
              <button onClick={handleImportClick} className="btn btn-outline btn-sm">Cargar Base de Datos</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text-main)' }}>Gestión de Usuarios</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Administra el acceso a la red local.</p>
            </div>
            <button onClick={() => { setEditingUser(undefined); setIsModalOpen(true); }} className="btn btn-primary btn-sm">
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#faf8f5', padding: '0.6rem', borderRadius: '50%', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                          <Icons.User />
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{user.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '1rem' }}>{user.password}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="btn btn-ghost btn-sm" title="Editar">
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
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay usuarios registrados</div>
            )}
          </div>
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

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}