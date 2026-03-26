const PropertyCard = ({ property, onAction, actionLabel, isFavourite }) => {
  return (
    <div className="property-card">
      {property.image_url && (
        <img src={property.image_url} alt={property.address} className="property-image" />
      )}
      <div className="property-info">
        <h3 className="property-address">{property.address}</h3>
        {property.price && <p className="property-price">{property.price}</p>}
        <button 
          onClick={() => onAction(property)} 
          className={`btn ${isFavourite ? 'btn-outline' : ''}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
