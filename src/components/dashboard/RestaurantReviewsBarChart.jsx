import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CHART_KEYS = [
  { key: 'foodQuality', name: 'Food' },
  { key: 'staffService', name: 'Service' },
  { key: 'cleanliness', name: 'Cleanliness' },
  { key: 'environment', name: 'Environment' },
];

function normalizeRestaurantId(value) {
  return String(value?._id ?? value ?? '');
}

function average(values) {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function buildReviewStats(reviews, restaurantId) {
  const currentRestaurantId = normalizeRestaurantId(restaurantId);
  const restaurantReviews = Array.isArray(reviews)
    ? reviews.filter((review) =>
        normalizeRestaurantId(review?.restaurant_id) === currentRestaurantId,
      )
    : [];

  return CHART_KEYS.map(({ key, name }) => {
    const values = restaurantReviews
      .map((review) => Number(review?.ratings?.[key]))
      .filter((value) => Number.isFinite(value));

    return {
      name,
      value: Number(average(values).toFixed(1)),
    };
  });
}

export default function RestaurantReviewsBarChart({ reviews = [], restaurantId }) {
  const data = buildReviewStats(reviews, restaurantId);
  const hasReviews = Array.isArray(reviews) && reviews.some(
    (review) => normalizeRestaurantId(review?.restaurant_id) === normalizeRestaurantId(restaurantId),
  );

  if (!hasReviews) {
    return (
      <div style={{
        width: '100%',
        padding: 'var(--sp-md)',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
      }}>
        <h3 style={{ marginBottom: 'var(--sp-sm)', fontSize: '0.95rem', fontWeight: 700 }}>Review Scores</h3>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: 'var(--text-sm)' }}>
          No hay reviews para este restaurante todavía.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minWidth: 0,
      padding: 'var(--sp-md)',
      borderRadius: '16px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      backdropFilter: 'blur(12px)',
    }}>
      <h3 style={{
        marginBottom: 'var(--sp-md)',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: 'var(--clr-text)',
      }}>
        Review Scores
      </h3>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--clr-text-muted)' }}
            />
            <YAxis
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              formatter={(value) => [value, 'Average']}
              contentStyle={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              isAnimationActive={true}
              barSize={35}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value > 5 ? '#10b981' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}