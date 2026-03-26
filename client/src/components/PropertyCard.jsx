const PropertyCard = ({ property, onAction, actionLabel, isFavourite }) => {
  return (
    <div className="property-card">
      <div className="property-image-container">
        {property.image_url && (
          <img src={property.image_url} alt={property.address} className="property-image" />
        )}
        {property.price && <div className="property-price-tag">{property.price}</div>}
      </div>
      <div className="property-info">
        <h3 className="property-address">{property.address}</h3>
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
