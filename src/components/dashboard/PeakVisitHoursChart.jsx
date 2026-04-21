import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DEFAULT_DATA = [
  { hour: '12:00', visits: 1800 },
  { hour: '13:00', visits: 2100 },
  { hour: '19:00', visits: 2500 },
  { hour: '20:00', visits: 2300 },
];

function normalizeRestaurantId(value) {
  return String(value?._id ?? value ?? '');
}

function buildPeakVisitStats(visits, restaurantId) {
  const currentRestaurantId = normalizeRestaurantId(restaurantId);

  const filteredVisits = Array.isArray(visits)
    ? visits.filter(
        (visit) =>
          normalizeRestaurantId(visit?.restaurant_id) === currentRestaurantId,
      )
    : [];

  if (!filteredVisits.length) {
    return DEFAULT_DATA;
  }

  const hourMap = {};

  filteredVisits.forEach((visit) => {
    const date = new Date(visit?.date || visit?.createdAt);
    const hour = String(date.getHours()).padStart(2, '0');
    const hourStr = `${hour}:00`;

    hourMap[hourStr] = (hourMap[hourStr] || 0) + 1;
  });

  return [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  ]
    .map((hour) => ({
      hour,
      visits: hourMap[hour] || 0,
    }))
    .filter((item) => item.visits > 0);
}

export default function PeakVisitHoursChart({ visits = [], restaurantId }) {
  const data = buildPeakVisitStats(visits, restaurantId);
  const hasVisits = data.length > 0;

  if (!hasVisits) {
    return (
      <div
        style={{
          width: '100%',
          padding: 'var(--sp-md)',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
        }}
      >
        <h3
          style={{
            marginBottom: 'var(--sp-sm)',
            fontSize: '0.95rem',
            fontWeight: 700,
          }}
        >
          Peak Visit Hours
        </h3>
        <p
          style={{
            color: 'var(--clr-text-muted)',
            fontSize: 'var(--text-sm)',
          }}
        >
          No hay visitas registradas todavía.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        
        padding: 'var(--sp-md)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <h3
        style={{
          marginBottom: 'var(--sp-md)',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: 'var(--clr-text)',
        }}
      >
        Peak Visit Hours
      </h3>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--clr-text-muted)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: 'var(--clr-primary)' }}
              formatter={(value) => [value, 'Visits']}
              contentStyle={{
                background: 'var(--glass-bg)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="hsl(48,96%,60%)"
              strokeWidth={2.5}
              dot={{
                fill: 'hsl(48,96%,60%)',
                r: 4,
                strokeWidth: 2,
                stroke: 'var(--glass-bg)',
              }}
              activeDot={{
                r: 6,
              }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
