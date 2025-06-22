import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import RatingStars from '../Ratings/RatingStars';
import CommentForm from '../Ratings/CommentForm';
import CommentList from '../Ratings/CommentList';
import ratingService from '../../services/ratingService';
import commentService from '../../services/commentService';
import dishService from '../../services/dishService';
import './DishCard.css';

const DishCard = ({ dish, date, compact = false, isFuture = false }) => {
  const { isVerified } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState('');
  const [currentAverageRating, setCurrentAverageRating] = useState(dish.averageRating || 0);

  // Format date for API calls (YYYY-MM-DD) using local time
  const formatDateForAPI = (dateObj) => {
    if (typeof dateObj === 'string') {
      // If it's already a string, check if it's ISO format
      if (dateObj.includes('T')) {
        return dateObj.split('T')[0]; // Extract YYYY-MM-DD from ISO string
      }
      return dateObj; // Assume it's already in YYYY-MM-DD format
    }
    // Use local date components to avoid timezone issues
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load user's existing rating when component mounts
  useEffect(() => {
    if (isVerified && !isFuture && date) {
      loadUserRating();
    }
  }, [dish._id, date, isVerified, isFuture]);

  // Update average rating when dish prop changes
  useEffect(() => {
    setCurrentAverageRating(dish.averageRating || 0);
  }, [dish.averageRating]);

  const loadUserRating = async () => {
    try {
      setIsLoadingRating(true);
      const formattedDate = formatDateForAPI(date);
      const rating = await ratingService.getMyRating(dish._id, formattedDate);
      if (rating) {
        setUserRating(rating.rating);
      }
    } catch (error) {
      console.error('Error loading user rating:', error);
    } finally {
      setIsLoadingRating(false);
    }
  };

  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      const formattedDate = formatDateForAPI(date);
      const response = await commentService.getCommentsForDish(dish._id, {
        menuDate: formattedDate,
        status: 'approved',
        limit: 20
      });
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const refreshAverageRating = async () => {
    try {
      const updatedDish = await dishService.getById(dish._id);
      if (updatedDish && typeof updatedDish.averageRating === 'number') {
        setCurrentAverageRating(updatedDish.averageRating);
      }
    } catch (error) {
      console.error('Error refreshing average rating:', error);
      // Don't show error to user for this background operation
    }
  };
  
  // Toggle comments visibility
  const toggleComments = () => {
    if (!compact) {
      setShowComments(!showComments);
      if (!showComments && comments.length === 0) {
        loadComments();
      }
    }
  };

  // Handle rating change
  const handleRatingChange = async (rating) => {
    if (isVerified && !isFuture && !isLoadingRating) {
      try {
        setIsLoadingRating(true);
        setError('');
        const formattedDate = formatDateForAPI(date);
        await ratingService.createOrUpdateRating(dish._id, formattedDate, rating);
        setUserRating(rating);
        
        // Refresh the average rating after successful submission
        await refreshAverageRating();
      } catch (error) {
        console.error('Error submitting rating:', error);
        setError('Nie udało się zapisać oceny. Spróbuj ponownie.');
      } finally {
        setIsLoadingRating(false);
      }
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (commentText) => {
    try {
      setError('');
      const formattedDate = formatDateForAPI(date);
      await commentService.createComment(dish._id, formattedDate, commentText);
      setShowCommentForm(false);
      // Reload comments to show the new one if it's approved immediately
      if (showComments) {
        loadComments();
      }
      // Show success message
      alert('Komentarz został wysłany do moderacji.');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Nie udało się wysłać komentarza. Spróbuj ponownie.');
    }
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
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="dish-rating">
          <div className="average-rating">
            <span>Średnia ocena: </span>
            <RatingStars value={currentAverageRating} readOnly={true} />
            <span className="rating-value">({currentAverageRating.toFixed(1)})</span>
          </div>
          
          {!compact && !isFuture && isVerified && (
            <div className="user-rating">
              <span>Twoja ocena: </span>
              <RatingStars 
                value={userRating} 
                onChange={handleRatingChange}
                readOnly={isLoadingRating}
              />
              {isLoadingRating && <span className="loading-text">Zapisywanie...</span>}
            </div>
          )}
        </div>
        
        {!compact && (
          <div className="dish-actions">
            <button 
              className="comments-toggle" 
              onClick={toggleComments}
              disabled={isFuture || isLoadingComments}
            >
              {isLoadingComments ? 'Ładowanie...' : 
               showComments ? 'Ukryj komentarze' : 'Pokaż komentarze'} ({comments.length})
            </button>
            
            {isVerified && !isFuture && (
              <button 
                className="add-comment-btn"
                onClick={() => setShowCommentForm(true)}
                disabled={showCommentForm}
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
          <CommentList comments={comments} />
        )}
      </div>
    </div>
  );
};

export default DishCard;