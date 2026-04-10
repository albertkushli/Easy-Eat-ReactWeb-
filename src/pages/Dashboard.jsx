import { useAuth } from '../context/AuthContext';
import HomeCustomer from './dashboard/HomeCustomer';
import HomeEmployee from './dashboard/HomeEmployee';

export default function Dashboard() {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <h2>No autorizado</h2>
          <p>Debes iniciar sesión para acceder al dashboard.</p>
        </div>
      </div>
    );
  }

  // Show different dashboard based on role
  if (role === 'customer') {
    return <HomeCustomer />;
  } else if (role === 'owner' || role === 'staff') {
    return <HomeEmployee />;
  } else {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <h2>Rol no reconocido</h2>
          <p>Tu rol de usuario no está configurado correctamente.</p>
        </div>
      </div>
    );
  }
}