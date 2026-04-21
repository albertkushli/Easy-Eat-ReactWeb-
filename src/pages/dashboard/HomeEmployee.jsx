import { useState, useEffect, useMemo } from 'react';
import { LogOut, Briefcase, QrCode, List, Settings, Clock, User, ChevronRight, TrendingUp, Users, Star, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RestaurantReviewsBarChart from '../../components/dashboard/RestaurantReviewsBarChart';
import PeakVisitHoursChart from '../../components/dashboard/PeakVisitHoursChart';
import TopDishCard from '../../components/dashboard/TopDishCard';
import apiClient from '../../lib/apiClient';

const DEFAULT_META = { total: 0, page: 1, limit: 1, totalPages: 1 };

async function getRestaurantStats(restaurantId) {
  const res = await apiClient.get(`/statistics/restaurant/${restaurantId}`, {
  });

  if (res.data?.data && !Array.isArray(res.data.data)) return res.data.data;
  if (res.data && !Array.isArray(res.data)) return res.data;
  return null;
}

function parsePaginatedVisitsResponse(payload, fallbackLimit = 8) {
  if (Array.isArray(payload?.visits)) {
    const visitsData = payload.visits;
    return {
      data: visitsData,
      meta: { total: visitsData.length, page: 1, limit: fallbackLimit, totalPages: 1 }
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

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function buildDishRatingsFromReviews(reviews) {
  if (!Array.isArray(reviews)) return [];

  // DEBUG: Log raw reviews structure
  if (reviews.length > 0) {
    console.log('[DEBUG buildDishRatings] First review object:', JSON.stringify(reviews[0], null, 2));
  }

  return reviews.flatMap((review) => {
    const entries = [];

    const restaurantId = String(review?.restaurant_id?._id ?? review?.restaurant_id ?? '');

    // Try multiple paths to extract dish_id
    const directDishId = 
      review?.dish_id?.toString?.() ||
      review?.dish?._id?.toString?.() ||
      String(review?.dish_id ?? review?.dish?._id ?? review?.dish ?? '');

    // Try multiple paths to extract rating
    const directRating = Number(
      review?.rating ?? 
      review?.dishRating ?? 
      review?.score ?? 
      review?.overallRating ?? 
      review?.ratings?.overall ??
      review?.rating_value ??
      0,
    );

    if (directDishId && Number.isFinite(directRating) && directRating > 0) {
      entries.push({
        dish_id: directDishId.toString(),
        restaurant_id: restaurantId,
        rating: directRating,
        deletedAt: review?.deletedAt ?? null,
      });
    }

    // Also check for nested dishRatings array
    const nestedDishRatings = Array.isArray(review?.dishRatings)
      ? review.dishRatings
      : Array.isArray(review?.dish_ratings)
        ? review.dish_ratings
        : [];

    nestedDishRatings.forEach((item) => {
      const dishId = String(item?.dish_id?._id ?? item?.dish_id ?? item?.dish?._id ?? item?.dish ?? '');
      const rating = Number(item?.rating ?? item?.score ?? item?.value ?? 0);

      if (!dishId || !Number.isFinite(rating) || rating <= 0) return;

      entries.push({
        dish_id: dishId.toString(),
        restaurant_id: String(item?.restaurant_id?._id ?? item?.restaurant_id ?? restaurantId ?? ''),
        rating,
        deletedAt: item?.deletedAt ?? null,
      });
    });

    return entries;
  });
}

export default function HomeEmployee() {
  const { user, logout, role, token, restaurant } = useAuth();
  const [visits, setVisits] = useState([]);
  const [visitsMeta, setVisitsMeta] = useState(DEFAULT_META);
  const [visitsPage, setVisitsPage] = useState(1);
  const [restaurantKpis, setRestaurantKpis] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwner = role === 'owner';

  useEffect(() => {
    async function fetchVisits() {
      setLoading(true);
      if (!user.restaurant_id) { setLoading(false); return; }
      try {
        const visitsLimit = 8;
        const res = await apiClient.get(`/restaurants/${user.restaurant_id}/visits`, {
          params: { page: visitsPage, limit: visitsLimit }
        });
        if (res.status === 200) {
          const parsedVisits = parsePaginatedVisitsResponse(res.data, visitsLimit);
          setVisits(parsedVisits.data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)));
          setVisitsMeta(parsedVisits.meta);
        }
      } catch (err) {
        console.error('Error fetching visits:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVisits();
  }, [user.restaurant_id, token, visitsPage]);

  useEffect(() => {
    async function fetchRestaurantKpis() {
      if (!token || !user?.restaurant_id) {
        setRestaurantKpis(null);
        return;
      }

      try {
        const currentRestaurantId = String(user.restaurant_id);
        const stats = await getRestaurantStats(currentRestaurantId);
        const statsRestaurantId = String(stats?.restaurant_id?._id ?? stats?.restaurant_id ?? '');

        setRestaurantKpis(statsRestaurantId === currentRestaurantId ? stats : null);
      } catch (err) {
        console.error('Error fetching restaurant KPIs:', err);
        setRestaurantKpis(null);
      }
    }

    fetchRestaurantKpis();
  }, [token, user?.restaurant_id]);

  useEffect(() => {
    async function fetchReviews() {
      if (!token || !user?.restaurant_id) {
        setReviews([]);
        return;
      }

      try {
        const res = await apiClient.get('/reviews');

        const payload = res.data;
        const allReviews = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.reviews)
              ? payload.reviews
              : [];

        setReviews(allReviews);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    }

    fetchReviews();
  }, [token, user?.restaurant_id]);

  useEffect(() => {
    async function fetchDishes() {
      if (!token || !user?.restaurant_id) {
        setDishes([]);
        return;
      }

      try {
        const res = await apiClient.get('/dishes');
        setDishes(extractArray(res.data, ['dishes']));
      } catch {
        // Dishes endpoint may not exist in all environments.
        setDishes([]);
      }
    }

    fetchDishes();
  }, [token, user?.restaurant_id]);

  const dishRatings = useMemo(
    () => buildDishRatingsFromReviews(reviews),
    [reviews],
  );

  // DEBUG: Log dishRatings construction
  useEffect(() => {
    console.log('[DEBUG] reviews count:', reviews.length);
    console.log('[DEBUG] dishRatings count:', dishRatings.length);
    console.log('[DEBUG] user.restaurant_id:', user?.restaurant_id);
    console.log('[DEBUG] dishes count:', dishes.length);
    if (dishRatings.length > 0) {
      console.log('[DEBUG] First dishRating:', dishRatings[0]);
      console.log('[DEBUG] Sample dishRatings (first 5):', dishRatings.slice(0, 5));
    }
  }, [reviews, dishRatings, dishes, user?.restaurant_id]);

  const restName = restaurant?.profile?.name || 'Tu restaurante';
  const restRating = restaurant?.profile?.globalRating;
  const restCity = restaurant?.profile?.location?.city;
  const restAddress = restaurant?.profile?.location?.address;
  const loyalCustomers = Number(restaurantKpis?.loyalCustomers ?? 0);
  const averagePointsPerVisit = Number(restaurantKpis?.averagePointsPerVisit ?? 0);

  // Wait for both visits and restaurant data (if employee)
  const isDataLoading = loading || ((role === 'owner' || role === 'staff') && !restaurant);

  if (isDataLoading) {
    return (
      <div className="he-loading">
        <div className="he-loading__spinner" />
        <p>Cargando panel de {isOwner ? 'Dueño' : 'Personal'}…</p>
      </div>
    );
  }

  return (
    <div className="he-page">

      {/* ── Header ── */}
      <header className="he-header">
        <div className="he-header__inner">
          <div className="he-brand">
            <span className="he-brand__icon">🍽️</span>
            <div>
              <span className="he-brand__name">EasyEat</span>
              <span className={`he-role-badge he-role-badge--${role}`}>{role?.toUpperCase()}</span>
            </div>
          </div>
          <div className="he-header__right">
            <div className="he-user-pill">
              <div className="he-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <span>{user.name?.split(' ')[0]}</span>
            </div>
            <button onClick={logout} className="he-logout-btn" title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="he-main">

        {/* ── Restaurant Hero ── */}
        <section className="he-hero">
          <div className="he-hero__left">
            <h1 className="he-hero__name">{restName}</h1>
            {restAddress && <p className="he-hero__address">📍 {restAddress}</p>}
          </div>
          <div className="he-hero__orbs">
            <div className="he-orb he-orb--1" />
            <div className="he-orb he-orb--2" />
          </div>
        </section>

        {/* ── Stats Row (Metrics) ── */}
        <div className="he-metrics-grid">
          <div className="he-stat he-stat--visits">
            <div className="he-stat__icon"><TrendingUp size={20} /></div>
            <div>
              <span className="he-stat__value">{averagePointsPerVisit}</span>
              <span className="he-stat__label">Average Points / Visit</span>
            </div>
          </div>
          <div className="he-stat he-stat--customers">
            <div className="he-stat__icon"><Users size={20} /></div>
            <div>
              <span className="he-stat__value">{loyalCustomers}</span>
              <span className="he-stat__label">Loyal Customers</span>
            </div>
          </div>
          <div className="he-stat he-stat--rating">
            <div className="he-stat__icon"><Star size={20} /></div>
            <div>
              <span className="he-stat__value">{Number(restRating ?? 0).toFixed(1)}</span>
              <span className="he-stat__label">Avg Rating</span>
            </div>
          </div>
        </div>

        {/* ── Charts Row (Full Width, 3 Columns) ── */}
        <div className="he-charts-grid">
          <div className="he-chart-slot">
            <RestaurantReviewsBarChart
              reviews={reviews}
              restaurantId={user?.restaurant_id}
            />
          </div>
          <div className="he-chart-slot">
            <PeakVisitHoursChart
              visits={visits}
              restaurantId={user?.restaurant_id}
            />
          </div>
          <div className="he-chart-slot">
            <TopDishCard
              restaurantId={user?.restaurant_id}
              title="Top Dish"
            />
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <section className="he-section">
          <h2 className="he-section__title">Acciones rápidas</h2>
          <div className="he-actions">
            <button className="he-action-card">
              <div className="he-action-card__icon he-action-card__icon--qr"><QrCode size={26} /></div>
              <span>Generar QR</span>
              <p>Escaneo de visita</p>
            </button>
            <button className="he-action-card">
              <div className="he-action-card__icon he-action-card__icon--list"><List size={26} /></div>
              <span>Ver visitas</span>
              <p>Historial completo</p>
            </button>
            {isOwner && (
              <button className="he-action-card">
                <div className="he-action-card__icon he-action-card__icon--settings"><Settings size={26} /></div>
                <span>Configuración</span>
                <p>Ajustes del local</p>
              </button>
            )}
          </div>
        </section>

        {/* ── Recent Visits ── */}
        <section className="he-section">
          <div className="he-section__head">
            <h2 className="he-section__title">Visitas recientes</h2>
            <span className="he-section__count">{visits.length} de {visitsMeta.total} registros</span>
          </div>
          <div className="he-visits">
            {visits.length > 0 ? visits.map((v, i) => (
              <div key={i} className="he-visit-row">
                <div className="he-visit-row__avatar">
                  {(v.customer_id?.name || v.customer_name)?.[0]?.toUpperCase() || <User size={16} />}
                </div>
                <div className="he-visit-row__info">
                  <span className="he-visit-row__name">{v.customer_id?.name || v.customer_name || 'Cliente'}</span>
                  <span className="he-visit-row__date">
                    <Clock size={12} />
                    {new Date(v.date || v.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {v.pointsEarned && (
                  <span className="he-visit-row__pts">+{v.pointsEarned} pts</span>
                )}
                <ChevronRight size={16} className="he-visit-row__arrow" />
              </div>
            )) : (
              <div className="he-empty">
                <Clock size={32} />
                <p>No hay visitas registradas todavía</p>
              </div>
            )}
          </div>
          <div className="he-pagination">
            <button
              type="button"
              className="he-pagination__btn"
              disabled={visitsMeta.page <= 1}
              onClick={() => setVisitsPage(prev => Math.max(1, prev - 1))}
            >
              Anterior
            </button>
            <span className="he-pagination__info">
              Página {visitsMeta.page} de {visitsMeta.totalPages}
            </span>
            <button
              type="button"
              className="he-pagination__btn"
              disabled={visitsMeta.page >= visitsMeta.totalPages}
              onClick={() => setVisitsPage(prev => Math.min(visitsMeta.totalPages, prev + 1))}
            >
              Siguiente
            </button>
          </div>
        </section>

      </main>

      <style>{`
        .he-page { min-height: 100vh; background: var(--clr-bg); font-family: var(--font); color: var(--clr-text); }

        .he-loading {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1rem; color: var(--clr-text-muted);
        }
        .he-loading__spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--clr-border); border-top-color: var(--clr-primary);
          border-radius: 50%; animation: he-spin 0.8s linear infinite;
        }
        @keyframes he-spin { to { transform: rotate(360deg); } }

        /* Header */
        .he-header {
          position: sticky; top: 0; z-index: 100;
          background: hsla(220,20%,6%,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
        }
        .he-header__inner {
          max-width: 1200px; margin: 0 auto; padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .he-brand { display: flex; align-items: center; gap: 0.6rem; }
        .he-brand__icon { font-size: 1.4rem; }
        .he-brand__name { font-size: 1.05rem; font-weight: 700; color: var(--clr-primary); margin-right: 0.4rem; }
        .he-role-badge {
          font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 999px;
          letter-spacing: 0.06em; vertical-align: middle;
        }
        .he-role-badge--owner { background: hsla(26,95%,55%,0.2); color: var(--clr-primary); border: 1px solid hsla(26,95%,55%,0.3); }
        .he-role-badge--staff { background: hsla(217,91%,60%,0.15); color: hsl(217,91%,70%); border: 1px solid hsla(217,91%,60%,0.25); }

        .he-header__right { display: flex; align-items: center; gap: 0.75rem; }
        .he-user-pill {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 0.9rem;
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          border-radius: 999px; font-size: 0.875rem; font-weight: 500;
        }
        .he-avatar {
          width: 26px; height: 26px;
          background: linear-gradient(135deg, hsl(217,91%,60%), hsl(142,71%,45%));
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 800; color: #fff;
        }
        .he-logout-btn {
          width: 36px; height: 36px; background: var(--glass-bg);
          border: 1px solid var(--glass-border); border-radius: 10px;
          color: var(--clr-text-muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .he-logout-btn:hover { color: hsl(0,80%,65%); border-color: hsla(0,80%,50%,0.4); background: hsla(0,80%,50%,0.08); }

        /* Main */
        .he-main {
          max-width: 1200px; margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
          display: flex; flex-direction: column; gap: 2.5rem;
        }

        /* Hero */
        .he-hero {
          position: relative; padding: 2.5rem;
          background: linear-gradient(135deg, hsla(217,91%,60%,0.1) 0%, hsla(142,71%,45%,0.06) 100%);
          border: 1px solid hsla(217,91%,60%,0.2); border-radius: 20px; overflow: hidden;
        }
        .he-hero__left { position: relative; z-index: 1; }
        .he-hero__label { font-size: 0.8rem; color: hsl(217,91%,70%); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
        .he-hero__name { font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 800; margin: 0.25rem 0 0.75rem; }
        .he-hero__meta { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
        .he-hero__tag {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.8rem; color: var(--clr-text-muted);
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          padding: 3px 10px; border-radius: 999px;
        }
        .he-hero__tag--star { color: hsl(48,96%,60%); }
        .he-hero__address { font-size: 0.82rem; color: var(--clr-text-muted); margin-top: 0.25rem; }
        .he-hero__orbs { position: absolute; inset: 0; pointer-events: none; }
        .he-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.25; }
        .he-orb--1 { width: 200px; height: 200px; background: hsl(217,91%,60%); top: -60px; right: -40px; }
        .he-orb--2 { width: 120px; height: 120px; background: var(--clr-accent); bottom: -30px; right: 100px; }

        /* Stats */
        .he-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
        .he-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .he-stat {
          padding: 1.25rem; border-radius: 16px;
          border: 1px solid var(--glass-border); background: var(--glass-bg);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; gap: 0.85rem;
          transition: transform 0.2s;
        }
        .he-stat:hover { transform: translateY(-3px); }
        .he-stat__icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .he-stat--visits .he-stat__icon { background: hsla(142,71%,45%,0.12); color: var(--clr-accent); }
        .he-stat--customers .he-stat__icon { background: hsla(217,91%,60%,0.12); color: hsl(217,91%,70%); }
        .he-stat--rating .he-stat__icon { background: hsla(48,96%,53%,0.12); color: hsl(48,96%,60%); }
        .he-stat__value { display: block; font-size: 1.6rem; font-weight: 800; line-height: 1; }
        .he-stat__label { display: block; font-size: 0.75rem; color: var(--clr-text-muted); margin-top: 3px; }

        /* Charts */
        .he-charts-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          width: 100%;
          margin-top: 2.5rem;
          align-items: stretch;
        }
        .he-chart-slot {
          min-width: 0;
          display: flex;
        }

        /* Section */
        .he-section { display: flex; flex-direction: column; gap: 1rem; }
        .he-section__head { display: flex; align-items: center; justify-content: space-between; }
        .he-section__title { font-size: 1.05rem; font-weight: 700; }
        .he-section__count { font-size: 0.8rem; color: var(--clr-text-muted); }

        /* Actions */
        .he-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
        .he-action-card {
          padding: 1.5rem 1rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border); background: var(--glass-bg);
          backdrop-filter: blur(12px);
          display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem;
          cursor: pointer; transition: all 0.2s var(--ease-out); text-align: left;
          color: var(--clr-text);
        }
        .he-action-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--clr-primary); }
        .he-action-card span { font-size: 0.95rem; font-weight: 700; }
        .he-action-card p { font-size: 0.75rem; color: var(--clr-text-muted); }
        .he-action-card__icon {
          width: 48px; height: 48px; border-radius: 14px; margin-bottom: 0.25rem;
          display: flex; align-items: center; justify-content: center;
        }
        .he-action-card__icon--qr { background: hsla(26,95%,55%,0.15); color: var(--clr-primary); }
        .he-action-card__icon--list { background: hsla(217,91%,60%,0.12); color: hsl(217,91%,70%); }
        .he-action-card__icon--settings { background: hsla(142,71%,45%,0.12); color: var(--clr-accent); }

        /* Visits */
        .he-visits {
          border: 1px solid var(--glass-border); border-radius: 16px;
          overflow: hidden; background: var(--glass-bg); backdrop-filter: blur(12px);
        }
        .he-visit-row {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--glass-border);
          transition: background 0.2s;
        }
        .he-visit-row:last-child { border-bottom: none; }
        .he-visit-row:hover { background: hsla(255,255,255,0.03); }
        .he-visit-row__avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, hsla(217,91%,60%,0.3), hsla(142,71%,45%,0.3));
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: 800; flex-shrink: 0; color: var(--clr-text);
        }
        .he-visit-row__info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .he-visit-row__name { font-size: 0.9rem; font-weight: 600; }
        .he-visit-row__date { font-size: 0.75rem; color: var(--clr-text-muted); display: flex; align-items: center; gap: 4px; }
        .he-visit-row__pts { font-size: 0.8rem; font-weight: 700; color: var(--clr-accent); }
        .he-visit-row__arrow { color: var(--clr-text-muted); }

        /* Empty */
        .he-empty {
          padding: 3rem; text-align: center; color: var(--clr-text-muted);
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
        }
        .he-empty p { font-size: 0.9rem; }
        .he-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
        .he-pagination__btn {
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--clr-text);
          padding: 0.45rem 0.9rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .he-pagination__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .he-pagination__info {
          font-size: 0.8rem;
          color: var(--clr-text-muted);
        }

        @media (max-width: 900px) {
          .he-charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
