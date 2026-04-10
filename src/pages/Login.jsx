import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User as UserIcon, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState('customer'); // 'customer' | 'employee'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Apply theme class to body/page
  useEffect(() => {
    document.body.className = '';
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(form.email, form.password, loginType);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`auth-page theme-${loginType}`}>
      {/* Background Effect Orbs */}
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />

      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">🍽️</div>
          <span className="brand-name">EasyEat</span>
          <span className="brand-tagline">Tu experiencia gastronómica Premium</span>
        </div>

        <h1 className="auth-title">Bienvenido de vuelta</h1>
        <p className="auth-subtitle">Inicia sesión para acceder a tu panel principal</p>

        {/* Tab Switcher - Changes the entire theme dynamically */}
        <div className="login-tabs">
          <button
            type="button"
            className={`tab-btn ${loginType === 'customer' ? 'active' : ''}`}
            onClick={() => setLoginType('customer')}
          >
            <UserIcon size={16} /> Cliente
          </button>
          <button
            type="button"
            className={`tab-btn ${loginType === 'employee' ? 'active' : ''}`}
            onClick={() => setLoginType('employee')}
          >
            <Briefcase size={16} /> Restaurante
          </button>
        </div>

        {error && (
          <div className="alert--error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Correo electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="Introduza tu correo..."
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="input-icon-right" 
                onClick={() => setShowPwd(v => !v)}
                title={showPwd ? "Ocultar Contraseña" : "Mostrar Contraseña"}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button id="login-submit-btn" type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Iniciando sesión…' : 'Acceder a mi cuenta'}
          </button>
        </form>

        {loginType === 'customer' && (
          <div className="auth-footer">
            ¿No tienes cuenta todavía? <Link to="/register" className="auth-link">Regístrate gratis</Link>
          </div>
        )}
      </div>
    </div>
  );
}