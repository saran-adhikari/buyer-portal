import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getFavourites, addFavourite, removeFavourite } from '../api';
import PropertyCard from '../components/PropertyCard';

const SAMPLE_PROPERTIES = [
  { 
    property_id: '1', 
    address: '123 Skyview Lane, Heights', 
    price: '$850,000', 
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    property_id: '2', 
    address: '45 Blue Ocean Drive, Coast', 
    price: '$1,200,000', 
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    property_id: '3', 
    address: '7 Hilltop Retreat, Valley', 
    price: '$650,000', 
    image_url: 'https://images.unsplash.com/photo-1549517045-bc93ec074b3f?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    property_id: '4', 
    address: '92 Maple Avenue, Suburb', 
    price: '$450,000', 
    image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    property_id: '5', 
    address: '15 Downtown Lofts, Central', 
    price: '$720,000', 
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80' 
  }
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userData, favData] = await Promise.all([
          getMe(token),
          getFavourites(token)
        ]);
        setUser(userData);
        setFavourites(favData);
      } catch (err) {
        setError(err.message);
        // If token invalid, redirect
        if (err.message.includes('Unauthorised')) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddFavourite = async (property) => {
    const token = localStorage.getItem('token');
    try {
      const data = await addFavourite(token, {
        propertyId: property.property_id,
        address: property.address,
        price: property.price,
        imageUrl: property.image_url
      });
      setFavourites([...favourites, data.favourite]);
      alert('Added to favourites!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveFavourite = async (property) => {
    const token = localStorage.getItem('token');
    try {
      await removeFavourite(token, property.property_id);
      setFavourites(favourites.filter(f => f.property_id !== property.property_id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container"><p>Loading dashboard...</p></div>;

  return (
    <div className="container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name} <span className="role-badge">{user?.role}</span></h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">Log Out</button>
      </header>

      {error && <p className="error-message">{error}</p>}

      <section>
        <h2 className="section-title">My Favourites</h2>
        {favourites.length === 0 ? (
          <div className="empty-state">
            <p>No favourites yet. Add some below!</p>
          </div>
        ) : (
          <div className="property-grid">
            {favourites.map(fav => (
              <PropertyCard 
                key={fav.property_id} 
                property={fav} 
                onAction={handleRemoveFavourite}
                actionLabel="Remove"
                isFavourite={true}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Available Properties</h2>
        <div className="property-grid">
          {SAMPLE_PROPERTIES.map(prop => {
            const isFav = favourites.some(f => f.property_id === prop.property_id);
            return (
              <PropertyCard 
                key={prop.property_id} 
                property={prop} 
                onAction={isFav ? handleRemoveFavourite : handleAddFavourite}
                actionLabel={isFav ? "In Favourites" : "Add to Favourites"}
                isFavourite={isFav}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
