import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation rules
  const rules = useMemo(() => {
    return {
      length: form.password.length >= 8,
      uppercase: /[A-Z]/.test(form.password),
      match: form.password !== '' && form.password === form.confirmPassword
    };
  }, [form.password, form.confirmPassword]);

  const isValid = rules.length && rules.uppercase && rules.match && form.name && form.email;

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValid) {
      setError('Por favor, completa correctamente todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password
      });

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

  // Component for checking rules visually
  const RuleChecker = ({ isValid, label }) => (
    <div className={`pwd-rule ${isValid ? 'valid' : ''}`}>
      <div className="pwd-icon">
        {isValid ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
      </div>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="auth-page theme-customer">
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />

      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">🍽️</div>
          <span className="brand-name">EasyEat</span>
          <span className="brand-tagline">Únete a nuestra comunidad hoy mismo</span>
        </div>

        <h1 className="auth-title">Crear nueva cuenta</h1>
        <p className="auth-subtitle">Rellena tus datos y empieza a disfrutar</p>

        {error && (
          <div className="alert--error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Nombre completo</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="register-name"
                className="form-input"
                type="text"
                name="name"
                placeholder="Ej. Juan Pérez"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Correo electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="register-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "0.5rem" }}>
            <label className="form-label" htmlFor="register-password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="register-password"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className="input-icon-right" 
                onClick={() => setShowPwd(v => !v)}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Checker */}
          <div className="pwd-tracker" style={{ marginBottom: "1.25rem" }}>
            <RuleChecker isValid={rules.length} label="Mínimo 8 caracteres de longitud" />
            <RuleChecker isValid={rules.uppercase} label="Incluye al menos una letra mayúscula" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">Confirmar contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="register-confirm-password"
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>
          
          {/* Match Rule dynamically shown below confirm password */}
          {form.confirmPassword && (
             <div className="pwd-tracker" style={{ marginTop: "-0.75rem", marginBottom: "1.25rem" }}>
               <RuleChecker isValid={rules.match} label="Las contraseñas coinciden perfectamente" />
             </div>
          )}

          <button 
            type="submit" 
            className="btn btn--primary" 
            disabled={loading || !isValid}
            style={{ marginTop: "1rem" }}
          >
            {loading ? 'Creando cuenta…' : 'Finalizar Registro'}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión en su lugar</Link>
        </div>
      </div>
    </div>
  );
}