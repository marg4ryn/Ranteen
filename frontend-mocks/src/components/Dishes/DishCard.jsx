import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import RatingStars from '../Ratings/RatingStars';
import CommentForm from '../Ratings/CommentForm';
import CommentList from '../Ratings/CommentList';
import './DishCard.css';

const DishCard = ({ dish, date, compact = false, isFuture = false }) => {
  const { isVerified } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  // Toggle comments visibility
  const toggleComments = () => {
    if (!compact) {
      setShowComments(!showComments);
    }
  };
  
  // Handle rating change
  const handleRatingChange = (rating) => {
    if (isVerified && !isFuture) {
      setUserRating(rating);
      // If user rated and comments are not shown, show comment form
      if (rating > 0 && !showComments) {
        setShowCommentForm(true);
      }
    }
  };
  
  // Handle comment submit
  const handleCommentSubmit = (comment) => {
    console.log(`Comment submitted for dish ${dish.id}: ${comment}`);
    setShowCommentForm(false);
    setShowComments(true);
  };
  
  return (
    <div className={`dish-card ${compact ? 'compact' : ''}`}>
      {dish.imageUrl && (
        <div className="dish-image">
          <img src={dish.imageUrl} alt={dish.name} />
        </div>
      )}
      
      <div className="dish-info">
        <h3>{dish.name}</h3>
        <span className="dish-category">{dish.category}</span>
        
        <p className="dish-description">{dish.description}</p>
        
        <div className="dish-rating">
          <div className="average-rating">
            <span>Średnia ocena: </span>
            <RatingStars value={dish.averageRating} readOnly={true} />
            <span className="rating-value">({dish.averageRating.toFixed(1)})</span>
          </div>
          
          {!compact && !isFuture && isVerified && (
            <div className="user-rating">
              <span>Twoja ocena: </span>
              <RatingStars value={userRating} onChange={handleRatingChange} />
            </div>
          )}
        </div>
        
        {!compact && (
          <div className="dish-actions">
            <button 
              className="comments-toggle" 
              onClick={toggleComments}
              disabled={isFuture}
            >
              {showComments ? 'Ukryj komentarze' : 'Pokaż komentarze'} ({dish.comments?.length || 0})
            </button>
            
            {isVerified && !isFuture && !showComments && (
              <button 
                className="add-comment-btn"
                onClick={() => setShowCommentForm(true)}
                disabled={userRating === 0}
              >
                Dodaj komentarz
              </button>
            )}
          </div>
        )}
        
        {showCommentForm && (
          <CommentForm 
            onSubmit={handleCommentSubmit} 
            onCancel={() => setShowCommentForm(false)} 
          />
        )}
        
        {showComments && (
          <CommentList comments={dish.comments || []} />
        )}
      </div>
    </div>
  );
};

export default DishCard;