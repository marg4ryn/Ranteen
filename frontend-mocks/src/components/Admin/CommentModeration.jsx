import React, { useState } from 'react';
import './CommentModeration.css';

// Mock data for pending comments
const pendingComments = [
  {
    id: 'pc1',
    text: 'Jedzenie było zimne, a porcja mała.',
    date: '2023-11-04T12:30:00',
    user: {
      id: '2',
      name: 'Anna Nowak',
      avatar: 'https://previews.123rf.com/images/stockbroker/stockbroker1408/stockbroker140802621/31052570-portret-%C5%82adna-dziewczyna-w-wie%C5%9B.jpg'
    },
    dish: {
      id: '1',
      name: 'Kotlet schabowy'
    },
    rating: 2
  },
  {
    id: 'pc2',
    text: 'Bardzo smaczne danie, poproszę więcej!',
    date: '2023-11-04T13:15:00',
    user: {
      id: '1',
      name: 'Jan Kowalski',
      avatar: 'https://v.wpimg.pl/eXkwLmpwSjkKFTpeXwxHLElNbgQZVUl6HlV2T19BU2ETR2MdHwUROQdaLQ8TDQEqBAAlCF4AFTsPGWIdHFgMNQoQKS4RFA09REV8X0FYVW5ERXxCAAUKMg4cOEASEh91Hw44GBwCSGs0QnxeFllIIFsOfBUIRxwhW1kmHRdVGA'
    },
    dish: {
      id: '6',
      name: 'Naleśniki z serem'
    },
    rating: 5
  },
  {
    id: 'pc3',
    text: 'Zupa była za słona, nie mogłem jej zjeść.',
    date: '2023-11-04T14:00:00',
    user: {
      id: '3',
      name: 'Piotr Wiśniewski',
      avatar: 'https://v.wpimg.pl/eXkwLmpwSjkKFTpeXwxHLElNbgQZVUl6HlV2T19BU2ETR2MdHwUROQdaLQ8TDQEqBAAlCF4AFTsPGWIdHFgMNQoQKS4RFA09REV8X0FYVW5ERXxCAAUKMg4cOEASEh91Hw44GBwCSGs0QnxeFllIIFsOfBUIRxwhW1kmHRdVGA'
    },
    dish: {
      id: '7',
      name: 'Rosół z makaronem'
    },
    rating: 1
  }
];

const CommentModeration = () => {
  const [comments, setComments] = useState(pendingComments);
  const [selectedComment, setSelectedComment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle comment approval
  const handleApprove = (commentId) => {
    // In a real app, this would call an API
    setComments(comments.filter(comment => comment.id !== commentId));
  };
  
  // Open rejection modal
  const openRejectModal = (comment) => {
    setSelectedComment(comment);
    setShowRejectModal(true);
  };
  
  // Handle comment rejection
  const handleReject = () => {
    // In a real app, this would call an API with the rejection reason
    setComments(comments.filter(comment => comment.id !== selectedComment.id));
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedComment(null);
  };
  
  // Filter comments based on rating
  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    if (filter === 'positive') return comment.rating >= 4;
    if (filter === 'neutral') return comment.rating >= 2 && comment.rating <= 3;
    if (filter === 'negative') return comment.rating === 1;
    return true;
  });
  
  return (
    <div className="comment-moderation-container">
      <h2>Moderacja komentarzy</h2>
      
      <div className="filter-controls">
        <label htmlFor="comment-filter">Filtruj komentarze:</label>
        <select 
          id="comment-filter" 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Wszystkie</option>
          <option value="positive">Pozytywne (4-5 ★)</option>
          <option value="neutral">Neutralne (2-3 ★)</option>
          <option value="negative">Negatywne (1 ★)</option>
        </select>
      </div>
      
      {filteredComments.length === 0 ? (
        <div className="no-pending-comments">
          <p>Brak komentarzy oczekujących na moderację.</p>
        </div>
      ) : (
        <div className="pending-comments-list">
          <h3>Komentarze oczekujące na moderację ({filteredComments.length})</h3>
          
          {filteredComments.map(comment => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="user-info">
                  <img 
                    src={comment.user.avatar} 
                    alt={comment.user.name} 
                    className="user-avatar" 
                  />
                  <span className="user-name">{comment.user.name}</span>
                </div>
                <div className="comment-meta">
                  <span className="comment-date">{formatDate(comment.date)}</span>
                  <div className="rating-display">
                    <span className="rating-value">{comment.rating}</span>
                    <span className="rating-star">★</span>
                  </div>
                </div>
              </div>
              
              <div className="comment-dish">
                <strong>Danie:</strong> {comment.dish.name}
              </div>
              
              <div className="comment-text">
                <p>{comment.text}</p>
              </div>
              
              <div className="comment-actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleApprove(comment.id)}
                >
                  Zatwierdź
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => openRejectModal(comment)}
                >
                  Odrzuć
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Rejection Modal */}
      {showRejectModal && selectedComment && (
        <div className="modal-backdrop">
          <div className="rejection-modal">
            <h3>Odrzuć komentarz</h3>
            <p>Czy na pewno chcesz odrzucić komentarz użytkownika <strong>{selectedComment.user.name}</strong>?</p>
            
            <div className="comment-preview">
              <p>"{selectedComment.text}"</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="rejection-reason">Powód odrzucenia (opcjonalnie):</label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Podaj powód odrzucenia komentarza..."
                rows={3}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowRejectModal(false)}
              >
                Anuluj
              </button>
              <button 
                className="confirm-reject-btn"
                onClick={handleReject}
              >
                Odrzuć komentarz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentModeration;