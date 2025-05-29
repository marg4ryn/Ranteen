import React, { useState } from 'react';
import './CommentForm.css';

const CommentForm = ({ onSubmit, onCancel }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (comment.trim()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        onSubmit(comment);
        setComment('');
        setIsSubmitting(false);
      }, 1000);
    }
  };
  
  return (
    <div className="comment-form-container">
      <h4>Dodaj komentarz</h4>
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Co sądzisz o tym daniu?"
          rows={3}
          required
          disabled={isSubmitting}
        />
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="cancel-btn"
          >
            Anuluj
          </button>
          <button 
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="submit-btn"
          >
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij komentarz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;