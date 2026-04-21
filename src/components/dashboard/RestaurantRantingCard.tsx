import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../lib/apiClient';

type RestaurantData = {
  profile?: {
    globalRating?: number;
  };
};

export default function RestaurantRantingCard() {
  const authCtx = useAuth() as any;
  const restaurantId = String(authCtx?.user?.restaurant_id ?? '');
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRestaurant() {
      if (!restaurantId) {
        setRestaurant(null);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.get(`/restaurants/${restaurantId}/full`);
        setRestaurant((response?.data as RestaurantData) ?? null);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurant();
  }, [restaurantId]);

  const rating = Number(restaurant?.profile?.globalRating ?? 0);
  const safeRating = Number.isFinite(rating) ? rating : 0;

  return (
    <div
      style={{
        border: '1px solid var(--glass-border)',
        borderRadius: 16,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        padding: 16,
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 10 }}>Restaurant Rating</h3>
      {loading ? (
        <p style={{ margin: 0, color: 'var(--clr-text-muted)' }}>Cargando...</p>
      ) : (
        <p style={{ margin: 0, fontWeight: 700 }}>⭐ {safeRating.toFixed(1)}</p>
      )}
    </div>
  );
}