import { useState, useEffect } from 'react';
import { LogOut, User, MapPin, Star, Search, Coins, Trophy, Heart, Clock, ChevronRight, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../lib/apiClient';

const DEFAULT_META = { total: 0, page: 1, limit: 1, totalPages: 1 };

function parsePaginatedListResponse(payload, fallbackLimit = 10) {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: { total: payload.length, page: 1, limit: fallbackLimit, totalPages: 1 }
    };
  }

  const data = Array.isArray(payload?.data) ? payload.data : [];
  const rawMeta = payload?.meta || {};
  const total = Number.isFinite(rawMeta.total) ? rawMeta.total : data.length;
  const page = Number.isFinite(rawMeta.page) ? rawMeta.page : 1;
  const limit = Number.isFinite(rawMeta.limit) ? rawMeta.limit : fallbackLimit;
  const totalPages = Number.isFinite(rawMeta.totalPages)
    ? rawMeta.totalPages
    : Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return { data, meta: { total, page, limit, totalPages } };
}

export default function HomeCustomer() {
  const { user, logout, token } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsMeta, setRestaurantsMeta] = useState(DEFAULT_META);
  const [restaurantsPage, setRestaurantsPage] = useState(1);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [pointsWallet, setPointsWallet] = useState([]);
  const [badges, setBadges] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);
  const [search, setSearch] = useState('');

  // Ensure pointsWallet is an array before reducing
  const totalPoints = Array.isArray(pointsWallet) 
    ? pointsWallet.reduce((sum, w) => sum + (w.points || 0), 0)
    : 0;

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const restaurantLimit = 6;
        const res = await apiClient.get('/restaurants', { params: { page: restaurantsPage, limit: restaurantLimit } });
        if (res.status === 200 && res.data) {
          const parsedRestaurants = parsePaginatedListResponse(res.data, restaurantLimit);
          setRestaurants(parsedRestaurants.data);
          setRestaurantsMeta(parsedRestaurants.meta);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      } finally {
        setLoadingRestaurants(false);
      }
    }
    fetchRestaurants();
  }, [restaurantsPage]);

  useEffect(() => {
    async function fetchCustomerData() {
      if (!token || !user?.id) {
        setLoadingCustomerData(false);
        return;
      }
      try {
        const [favRes, ptsRes, badgesRes, visitsRes] = await Promise.allSettled([
          apiClient.get(`/customers/${user.id}/favouriteRestaurants`, { params: { page: 1, limit: 10 } }),
          apiClient.get(`/customers/${user.id}/pointsWallet`, { params: { page: 1, limit: 20 } }),
          apiClient.get(`/customers/${user.id}/badges`, { params: { page: 1, limit: 10 } }),
          apiClient.get(`/customers/${user.id}/visits`, { params: { page: 1, limit: 20 } }),
        ]);

        if (favRes.status === 'fulfilled' && favRes.value.data) {
          const parsedFavorites = parsePaginatedListResponse(favRes.value.data, 10);
          setFavoriteRestaurants(parsedFavorites.data);
        }
        if (ptsRes.status === 'fulfilled' && ptsRes.value.data) {
          const parsedPoints = parsePaginatedListResponse(ptsRes.value.data, 20);
          setPointsWallet(parsedPoints.data);
        }
        if (badgesRes.status === 'fulfilled' && badgesRes.value.data) {
          const parsedBadges = parsePaginatedListResponse(badgesRes.value.data, 10);
          setBadges(parsedBadges.data);
        }
        if (visitsRes.status === 'fulfilled' && visitsRes.value.data) {
          const parsedVisits = parsePaginatedListResponse(visitsRes.value.data, 20);
          setVisits(parsedVisits.data);
        }
      } catch (err) {
        console.error('Error fetching customer data:', err);
      } finally {
        setLoadingCustomerData(false);
      }
    }
    fetchCustomerData();
  }, [token, user?.id]);

  const loading = loadingRestaurants || loadingCustomerData;

  const filtered = Array.isArray(restaurants) ? restaurants.filter(r =>
    r.profile?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.profile?.location?.city?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="hc-loading">
        <div className="hc-loading__spinner" />
        <p>Cargando tu experiencia…</p>
      </div>
    );
  }

  return (
    <div className="hc-page">
      {/* ── Header ── */}
      <header className="hc-header">
        <div className="hc-header__inner">
          <div className="hc-brand">
            <span className="hc-brand__icon">🍽️</span>
            <span className="hc-brand__name">EasyEat</span>
          </div>
          <div className="hc-header__right">
            <div className="hc-user-pill">
              <div className="hc-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span>{user?.name?.split(' ')[0]}</span>
            </div>
            <button onClick={logout} className="hc-logout-btn" title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="hc-main">

        {/* ── Hero Welcome ── */}
        <section className="hc-hero">
          <div className="hc-hero__text">
            <p className="hc-hero__greeting">Bienvenido de vuelta,</p>
            <h1 className="hc-hero__name">{user?.name?.split(' ')[0]} 👋</h1>
            <p className="hc-hero__sub">Descubre sabores que te esperan hoy</p>
          </div>
          <div className="hc-hero__orbs">
            <div className="hc-orb hc-orb--1" />
            <div className="hc-orb hc-orb--2" />
          </div>
        </section>

        {/* ── Stats Row ── */}
        <section className="hc-stats">
          <div className="hc-stat-card hc-stat-card--points">
            <div className="hc-stat-card__icon"><Coins size={22} /></div>
            <div className="hc-stat-card__info">
              <span className="hc-stat-card__value">{totalPoints.toLocaleString()}</span>
              <span className="hc-stat-card__label">Puntos totales</span>
            </div>
          </div>
          <div className="hc-stat-card hc-stat-card--visits">
            <div className="hc-stat-card__icon"><Flame size={22} /></div>
            <div className="hc-stat-card__info">
              <span className="hc-stat-card__value">{Array.isArray(visits) ? visits.length : 0}</span>
              <span className="hc-stat-card__label">Visitas</span>
            </div>
          </div>
          <div className="hc-stat-card hc-stat-card--badges">
            <div className="hc-stat-card__icon"><Trophy size={22} /></div>
            <div className="hc-stat-card__info">
              <span className="hc-stat-card__value">{Array.isArray(badges) ? badges.length : 0}</span>
              <span className="hc-stat-card__label">Badges</span>
            </div>
          </div>
          <div className="hc-stat-card hc-stat-card--favs">
            <div className="hc-stat-card__icon"><Heart size={22} /></div>
            <div className="hc-stat-card__info">
              <span className="hc-stat-card__value">{Array.isArray(favoriteRestaurants) ? favoriteRestaurants.length : 0}</span>
              <span className="hc-stat-card__label">Favoritos</span>
            </div>
          </div>
        </section>

        {/* ── Search ── */}
        <section className="hc-search-wrap">
          <div className="hc-search">
            <Search size={18} className="hc-search__icon" />
            <input
              className="hc-search__input"
              type="text"
              placeholder="Buscar restaurantes o ciudades…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </section>

        {/* ── Favoritos ── */}
        {Array.isArray(favoriteRestaurants) && favoriteRestaurants.length > 0 && (
          <section className="hc-section">
            <div className="hc-section__head">
              <h2 className="hc-section__title"><Heart size={18} /> Tus favoritos</h2>
            </div>
            <div className="hc-cards hc-cards--favs">
              {favoriteRestaurants.slice(0, 3).map((r, i) => (
                <RestaurantCard key={i} restaurant={r} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── Todos los restaurantes ── */}
        <section className="hc-section">
          <div className="hc-section__head">
            <h2 className="hc-section__title"><MapPin size={18} /> Cerca de ti</h2>
            <span className="hc-section__count">{filtered.length} en esta página · {restaurantsMeta.total} total</span>
          </div>
          {filtered.length > 0 ? (
            <div className="hc-cards">
              {filtered.map((r, i) => (
                <RestaurantCard key={i} restaurant={r} />
              ))}
            </div>
          ) : (
            <div className="hc-empty">
              <p>No se encontraron restaurantes para "<strong>{search}</strong>"</p>
            </div>
          )}
          <div className="hc-pagination">
            <button
              type="button"
              className="hc-pagination__btn"
              disabled={restaurantsMeta.page <= 1}
              onClick={() => setRestaurantsPage(prev => Math.max(1, prev - 1))}
            >
              Anterior
            </button>
            <span className="hc-pagination__info">
              Página {restaurantsMeta.page} de {restaurantsMeta.totalPages}
            </span>
            <button
              type="button"
              className="hc-pagination__btn"
              disabled={restaurantsMeta.page >= restaurantsMeta.totalPages}
              onClick={() => setRestaurantsPage(prev => Math.min(restaurantsMeta.totalPages, prev + 1))}
            >
              Siguiente
            </button>
          </div>
        </section>

        {/* ── Visitas recientes ── */}
        {Array.isArray(visits) && visits.length > 0 && (
          <section className="hc-section">
            <div className="hc-section__head">
              <h2 className="hc-section__title"><Clock size={18} /> Visitas recientes</h2>
            </div>
            <div className="hc-visits">
              {visits.slice(0, 5).map((v, i) => (
                <div key={i} className="hc-visit-item">
                  <div className="hc-visit-item__dot" />
                  <div className="hc-visit-item__info">
                    <span className="hc-visit-item__name">{v.restaurant_id?.profile?.name || v.restaurant_name || 'Restaurante'}</span>
                    <span className="hc-visit-item__date">{new Date(v.date || v.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {v.pointsEarned && (
                    <span className="hc-visit-item__pts">+{v.pointsEarned} pts</span>
                  )}
                  <ChevronRight size={16} className="hc-visit-item__arrow" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Badges ── */}
        {Array.isArray(badges) && badges.length > 0 && (
          <section className="hc-section">
            <div className="hc-section__head">
              <h2 className="hc-section__title"><Trophy size={18} /> Tus logros</h2>
            </div>
            <div className="hc-badges">
              {badges.map((b, i) => (
                <div key={i} className="hc-badge">
                  <div className="hc-badge__icon">{b.icon || '🏅'}</div>
                  <span className="hc-badge__name">{b.title || `Badge ${i + 1}`}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      <style>{`
        /* ── Page ── */
        .hc-page {
          min-height: 100vh;
          background: var(--clr-bg);
          font-family: var(--font);
          color: var(--clr-text);
        }

        /* ── Loading ── */
        .hc-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: var(--clr-text-muted);
        }
        .hc-loading__spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--clr-border);
          border-top-color: var(--clr-primary);
          border-radius: 50%;
          animation: hc-spin 0.8s linear infinite;
        }
        @keyframes hc-spin { to { transform: rotate(360deg); } }

        /* ── Header ── */
        .hc-header {
          position: sticky; top: 0; z-index: 100;
          background: hsla(220,20%,6%,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
        }
        .hc-header__inner {
          max-width: 1200px; margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .hc-brand { display: flex; align-items: center; gap: 0.5rem; }
        .hc-brand__icon { font-size: 1.4rem; }
        .hc-brand__name { font-size: 1.1rem; font-weight: 700; color: var(--clr-primary); }
        .hc-header__right { display: flex; align-items: center; gap: 0.75rem; }
        .hc-user-pill {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 999px;
          font-size: 0.875rem; font-weight: 500;
        }
        .hc-user-avatar {
          width: 26px; height: 26px;
          background: var(--grad-brand);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 800; color: #000;
        }
        .hc-logout-btn {
          width: 36px; height: 36px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          color: var(--clr-text-muted);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .hc-logout-btn:hover { color: hsl(0,80%,65%); border-color: hsla(0,80%,50%,0.4); background: hsla(0,80%,50%,0.08); }

        /* ── Main ── */
        .hc-main {
          max-width: 1200px; margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
          display: flex; flex-direction: column; gap: 2.5rem;
        }

        /* ── Hero ── */
        .hc-hero {
          position: relative;
          padding: 2.5rem;
          background: linear-gradient(135deg, hsla(26,95%,55%,0.12) 0%, hsla(142,71%,45%,0.06) 100%);
          border: 1px solid hsla(26,95%,55%,0.2);
          border-radius: 20px;
          overflow: hidden;
        }
        .hc-hero__text { position: relative; z-index: 1; }
        .hc-hero__greeting { font-size: 0.875rem; color: var(--clr-primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
        .hc-hero__name { font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 800; margin: 0.2rem 0 0.5rem; }
        .hc-hero__sub { font-size: 0.95rem; color: var(--clr-text-muted); }
        .hc-hero__orbs { position: absolute; inset: 0; pointer-events: none; }
        .hc-orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); opacity: 0.3;
        }
        .hc-orb--1 { width: 200px; height: 200px; background: var(--clr-primary); top: -60px; right: -40px; }
        .hc-orb--2 { width: 140px; height: 140px; background: var(--clr-accent); bottom: -40px; right: 80px; }

        /* ── Stats ── */
        .hc-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 640px) { .hc-stats { grid-template-columns: repeat(4, 1fr); } }

        .hc-stat-card {
          padding: 1.25rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; gap: 0.85rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hc-stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .hc-stat-card__icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .hc-stat-card--points .hc-stat-card__icon { background: hsla(26,95%,55%,0.15); color: var(--clr-primary); }
        .hc-stat-card--visits .hc-stat-card__icon { background: hsla(0,80%,60%,0.12); color: hsl(0,80%,65%); }
        .hc-stat-card--badges .hc-stat-card__icon { background: hsla(48,96%,53%,0.12); color: hsl(48,96%,60%); }
        .hc-stat-card--favs .hc-stat-card__icon { background: hsla(340,80%,60%,0.12); color: hsl(340,80%,65%); }
        .hc-stat-card__value { display: block; font-size: 1.5rem; font-weight: 800; line-height: 1; }
        .hc-stat-card__label { display: block; font-size: 0.75rem; color: var(--clr-text-muted); margin-top: 3px; }

        /* ── Search ── */
        .hc-search-wrap { }
        .hc-search {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.85rem 1.25rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          backdrop-filter: blur(12px);
          transition: border-color 0.2s;
        }
        .hc-search:focus-within { border-color: var(--clr-primary); }
        .hc-search__icon { color: var(--clr-text-muted); flex-shrink: 0; }
        .hc-search__input {
          flex: 1; background: none; border: none; outline: none;
          font-family: var(--font); font-size: 0.95rem; color: var(--clr-text);
        }
        .hc-search__input::placeholder { color: var(--clr-text-muted); }

        .hc-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .hc-pagination__btn {
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--clr-text);
          padding: 0.45rem 0.9rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .hc-pagination__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .hc-pagination__info {
          font-size: 0.8rem;
          color: var(--clr-text-muted);
        }

        /* ── Section ── */
        .hc-section { display: flex; flex-direction: column; gap: 1rem; }
        .hc-section__head { display: flex; align-items: center; justify-content: space-between; }
        .hc-section__title {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 1.1rem; font-weight: 700;
        }
        .hc-section__count { font-size: 0.8rem; color: var(--clr-text-muted); }

        /* ── Restaurant Cards ── */
        .hc-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }
        .hc-cards--favs { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }

        .hc-res-card {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          transition: transform 0.25s var(--ease-out), box-shadow 0.25s;
          cursor: pointer;
        }
        .hc-res-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
        .hc-res-card__img {
          height: 160px; overflow: hidden; position: relative;
          background: var(--clr-surface-2);
        }
        .hc-res-card__img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease;
        }
        .hc-res-card:hover .hc-res-card__img img { transform: scale(1.07); }
        .hc-res-card__img--placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem;
          background: linear-gradient(135deg, var(--clr-surface), var(--clr-surface-2));
        }
        .hc-res-card__rating {
          position: absolute; top: 10px; right: 10px;
          background: hsla(0,0%,0%,0.65);
          backdrop-filter: blur(8px);
          padding: 3px 8px; border-radius: 999px;
          display: flex; align-items: center; gap: 4px;
          font-size: 0.75rem; font-weight: 700; color: hsl(48,96%,60%);
          border: 1px solid hsla(255,255,255,0.1);
        }
        .hc-res-card__body { padding: 1rem; }
        .hc-res-card__name { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.3rem; }
        .hc-res-card__desc {
          font-size: 0.8rem; color: var(--clr-text-muted);
          line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; margin-bottom: 0.75rem;
        }
        .hc-res-card__meta { display: flex; gap: 0.75rem; }
        .hc-res-card__tag {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.75rem; color: var(--clr-text-muted);
        }

        /* ── Visits ── */
        .hc-visits {
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          overflow: hidden;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
        }
        .hc-visit-item {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--glass-border);
          transition: background 0.2s;
        }
        .hc-visit-item:last-child { border-bottom: none; }
        .hc-visit-item:hover { background: hsla(255,255,255,0.03); }
        .hc-visit-item__dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--clr-accent); flex-shrink: 0;
        }
        .hc-visit-item__info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .hc-visit-item__name { font-size: 0.9rem; font-weight: 600; }
        .hc-visit-item__date { font-size: 0.75rem; color: var(--clr-text-muted); }
        .hc-visit-item__pts { font-size: 0.8rem; font-weight: 700; color: var(--clr-accent); }
        .hc-visit-item__arrow { color: var(--clr-text-muted); }

        /* ── Badges ── */
        .hc-badges {
          display: flex; flex-wrap: wrap; gap: 0.75rem;
        }
        .hc-badge {
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          padding: 1rem 1.25rem;
          border-radius: 14px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          transition: transform 0.2s, border-color 0.2s;
          min-width: 80px;
        }
        .hc-badge:hover { transform: translateY(-3px); border-color: hsl(48,96%,53%); }
        .hc-badge__icon { font-size: 2rem; }
        .hc-badge__name { font-size: 0.7rem; color: var(--clr-text-muted); text-align: center; font-weight: 600; }

        /* ── Empty ── */
        .hc-empty {
          padding: 2.5rem;
          text-align: center;
          color: var(--clr-text-muted);
          border: 1px dashed var(--clr-border);
          border-radius: 16px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

function RestaurantCard({ restaurant: r }) {
  const img = r?.profile?.image?.[0];
  return (
    <div className="hc-res-card">
      <div className="hc-res-card__img">
        {img
          ? <img src={img} alt={r?.profile?.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          : null}
        <div className="hc-res-card__img--placeholder" style={{ display: img ? 'none' : 'flex' }}>🍴</div>
        {r?.profile?.globalRating && (
          <div className="hc-res-card__rating">
            <Star size={12} fill="currentColor" />
            {Number(r.profile.globalRating).toFixed(1)}
          </div>
        )}
      </div>
      <div className="hc-res-card__body">
        <p className="hc-res-card__name">{r?.profile?.name}</p>
        {r?.profile?.description && <p className="hc-res-card__desc">{r.profile.description}</p>}
        <div className="hc-res-card__meta">
          {r?.profile?.location?.city && (
            <span className="hc-res-card__tag">
              <MapPin size={12} />{r.profile.location.city}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
