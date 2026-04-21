import { Link } from 'react-router-dom';
import { 
  Utensils, 
  Trophy, 
  Gift, 
  BarChart3, 
  Users, 
  MapPin, 
  Search, 
  CheckCircle, 
  ChevronRight,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="lp-nav">
        <Link to="/" className="lp-logo">
          <span style={{ fontSize: '1.5rem' }}>🍽️</span> 
          <span>EasyEat</span>
        </Link>
        <div className="lp-nav-links">
          <a href="#clientes" className="lp-link">Clientes</a>
          <a href="#restaurantes" className="lp-link">Restaurantes</a>
          <a href="#funciona" className="lp-link">Cómo funciona</a>
          <Link to="/login" className="lp-btn-acceder">Acceder</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="lp-hero">
        <div className="hero-gradient-orb"></div>
        <div className="hero-gradient-orb hero-gradient-orb--2"></div>
        
        <div className="lp-hero-content">
          <h1 className="lp-hero-title">
            <span className="text-orange">Gana puntos.</span><br />
            <span className="text-green">Come más.</span><br />
            Vive mejor.
          </h1>
          <p className="lp-hero-subtitle">
            La plataforma de fidelización que recompensa cada bocado. Conecta con tus restaurantes favoritos y consigue premios exclusivos.
          </p>
          
          <div className="lp-hero-ctas">
            <a href="#clientes" className="lp-cta-btn lp-cta-btn--orange">
              Soy cliente <ChevronRight size={20} />
            </a>
            <a href="#restaurantes" className="lp-cta-btn lp-cta-btn--green">
              Soy restaurante <ChevronRight size={20} />
            </a>
          </div>

          <Link to="/login" className="lp-hero-admin-link">
            ¿Eres administrador? Accede aquí <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Split Propositions */}
      <section className="lp-split-section" id="clientes">
        <div className="lp-split-pane lp-split-pane--customer">
          <div className="split-icon">⭐</div>
          <h2 className="split-title">Para ti, foodie</h2>
          <ul className="split-list">
            <li className="split-item">
              <div className="split-item-icon"><MapPin size={24} /></div>
              <span>Descubre restaurantes cerca de ti</span>
            </li>
            <li className="split-item">
              <div className="split-item-icon"><Trophy size={24} /></div>
              <span>Acumula puntos con cada visita</span>
            </li>
            <li className="split-item">
              <div className="split-item-icon"><Gift size={24} /></div>
              <span>Canjea recompensas exclusivas gratis</span>
            </li>
          </ul>
        </div>
        
        <div className="lp-split-pane lp-split-pane--restaurant" id="restaurantes">
          <div className="split-icon">📊</div>
          <h2 className="split-title">Para tu negocio</h2>
          <ul className="split-list">
            <li className="split-item">
              <div className="split-item-icon"><BarChart3 size={24} /></div>
              <span>Analiza visitas y estadísticas reales</span>
            </li>
            <li className="split-item">
              <div className="split-item-icon"><Users size={24} /></div>
              <span>Fideliza a tus clientes con puntos</span>
            </li>
            <li className="split-item">
              <div className="split-item-icon"><Zap size={24} /></div>
              <span>Gestiona carta y premios fácilmente</span>
            </li>
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="lp-steps-section" id="funciona">
        <h2 className="lp-section-title">Tan fácil como comer</h2>
        <div className="lp-steps-grid">
          <div className="lp-step-card">
            <div className="step-number">01</div>
            <div className="step-content">
              <div className="step-icon" style={{ color: 'var(--lp-orange)' }}>
                <Search size={32} />
              </div>
              <h3 className="step-title">Encuentra</h3>
              <p className="step-desc">Busca por categoría, ubicación o valoración y descubre tu próximo sitio favorito.</p>
            </div>
          </div>
          
          <div className="lp-step-card">
            <div className="step-number">02</div>
            <div className="step-content">
              <div className="step-icon" style={{ color: 'var(--lp-green)' }}>
                <MapPin size={32} />
              </div>
              <h3 className="step-title">Visita</h3>
              <p className="step-desc">Haz check-in al llegar y acumula puntos automáticamente por cada comida.</p>
            </div>
          </div>
          
          <div className="lp-step-card">
            <div className="step-number">03</div>
            <div className="step-content">
              <div className="step-icon" style={{ color: 'var(--lp-orange)' }}>
                <Gift size={32} />
              </div>
              <h3 className="step-title">Disfruta</h3>
              <p className="step-desc">Canjea tus puntos acumulados por platos gratis, descuentos o experiencias únicas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="lp-stats-section">
        <div className="lp-stats-grid">
          <div className="stat-item">
            <span className="stat-value text-orange">+200</span>
            <span className="stat-label">Restaurantes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-green">+3.4k</span>
            <span className="stat-label">Usuarios</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-orange">+12k</span>
            <span className="stat-label">Visitas</span>
          </div>
        </div>
        <p style={{ marginTop: '50px', opacity: 0.6, fontWeight: 700, letterSpacing: '1px' }}>
          CRECIENDO CADA SEMANA EN BARCELONA
        </p>
      </section>

      {/* CTA Portal */}
      <section className="lp-final-cta">
        <div className="cta-box">
          <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '24px' }}>
            ¿Listo para empezar a ganar?
          </h2>
          <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Únete a los miles de usuarios que ya están disfrutando de las mejores ventajas en los mejores restaurantes.
          </p>
          <Link to="/login" className="lp-cta-btn lp-cta-btn--orange" style={{ display: 'inline-flex', margin: '0 auto' }}>
            Acceder a mi cuenta <ArrowRight size={20} />
          </Link>
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
              <CheckCircle size={16} className="text-green" /> Sin tarjetas físicas
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
              <CheckCircle size={16} className="text-green" /> 100% Gratuito
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">EasyEat</div>
            <p className="footer-tagline">Revolucionando la fidelización en el sector de la restauración.</p>
          </div>
          <div>
            <h4 className="footer-title">Plataforma</h4>
            <ul className="footer-links">
              <li><a href="#clientes" className="footer-link">Para Clientes</a></li>
              <li><a href="#restaurantes" className="footer-link">Para Restaurantes</a></li>
              <li><a href="#funciona" className="footer-link">Cómo funciona</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Términos y condiciones</a></li>
              <li><a href="#" className="footer-link">Privacidad</a></li>
              <li><a href="#" className="footer-link">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 EasyEat · Proyecto Académico · UPC · Barcelona</p>
        </div>
      </footer>
    </div>
  );
}
