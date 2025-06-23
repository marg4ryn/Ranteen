import React, { useState, useEffect } from 'react';
import commentService from '../../services/commentService';
import Spinner from '../Layout/Spinner';
import './CommentModeration.css';

const CommentModeration = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch comments for moderation
  const fetchComments = async (page = 1, status = filter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await commentService.getAllCommentsForModeration({
        page,
        limit: 10,
        status: status === 'all' ? undefined : status
      });
      
      setComments(response.comments || []);
      setCurrentPage(response.currentPage || 1);
      setTotalPages(response.totalPages || 1);
      setTotalComments(response.totalComments || 0);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Błąd podczas pobierania komentarzy: ' + err.message);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load comments on component mount and filter change
  useEffect(() => {
    fetchComments(1, filter);
    setCurrentPage(1);
  }, [filter]);

  // Handle comment approval
  const handleApprove = async (commentId) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      await commentService.moderateComment(commentId, 'approved');
      // Remove from current list if we're viewing pending/rejected, or refresh if viewing all/approved
      if (filter === 'pending' || filter === 'rejected') {
        setComments(comments.filter(comment => comment._id !== commentId));
        setTotalComments(prev => prev - 1);
      } else {
        await fetchComments(currentPage, filter);
      }
    } catch (err) {
      console.error('Error approving comment:', err);
      setError('Błąd podczas zatwierdzania komentarza: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Open rejection modal
  const openRejectModal = (comment) => {
    setSelectedComment(comment);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  // Close rejection modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedComment(null);
    setRejectionReason('');
  };
  
  // Handle comment rejection
  const handleReject = async () => {
    if (!selectedComment || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      await commentService.moderateComment(selectedComment._id, 'rejected');
      // Remove from current list if we're viewing pending/approved, or refresh if viewing all/rejected
      if (filter === 'pending' || filter === 'approved') {
        setComments(comments.filter(comment => comment._id !== selectedComment._id));
        setTotalComments(prev => prev - 1);
      } else {
        await fetchComments(currentPage, filter);
      }
      closeRejectModal();
    } catch (err) {
      console.error('Error rejecting comment:', err);
      setError('Błąd podczas odrzucania komentarza: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchComments(newPage, filter);
    }
  };
  
  return (
    <div className="comment-moderation-container">
      <h2>Moderacja komentarzy</h2>
      
      <div className="filter-controls">
        <label htmlFor="comment-filter">Filtruj komentarze:</label>
        <select 
          id="comment-filter" 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={loading}
        >
          <option value="pending">Oczekujące na moderację</option>
          <option value="approved">Zatwierdzone</option>
          <option value="rejected">Odrzucone</option>
          <option value="all">Wszystkie</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchComments(currentPage, filter)}>
            Spróbuj ponownie
          </button>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <div className="no-pending-comments">
          <p>Brak komentarzy w wybranej kategorii.</p>
        </div>
      ) : (
        <>
          <div className="pending-comments-list">
            <h3>
              {filter === 'pending' && 'Komentarze oczekujące na moderację'}
              {filter === 'approved' && 'Zatwierdzone komentarze'}
              {filter === 'rejected' && 'Odrzucone komentarze'}
              {filter === 'all' && 'Wszystkie komentarze'}
              {' '}({totalComments})
            </h3>
            
            {comments.map(comment => (
              <div key={comment._id} className={`comment-card ${comment.status}`}>
                <div className="comment-header">
                  <div className="user-info">
                    <img 
                      src={comment.student?.profilePictureUrl || '/default-avatar.png'} 
                      alt={comment.student?.name || 'Student'} 
                      className="user-avatar" 
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <span className="user-name">{comment.student?.name || 'Nieznany użytkownik'}</span>
                      {comment.student?.email && (
                        <span className="user-email">{comment.student.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="comment-meta">
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    <span className={`comment-status ${comment.status}`}>
                      {comment.status === 'pending' && 'Oczekujący'}
                      {comment.status === 'approved' && 'Zatwierdzony'}
                      {comment.status === 'rejected' && 'Odrzucony'}
                    </span>
                  </div>
                </div>
                
                <div className="comment-dish">
                  <strong>Danie:</strong> {comment.dish?.name || 'Nieznane danie'}
                </div>

                <div className="comment-date-served">
                  <strong>Data serwowania:</strong> {formatDate(comment.date)}
                </div>
                
                <div className="comment-text">
                  <p>{comment.text}</p>
                </div>

                {comment.moderatedBy && comment.moderationTimestamp && (
                  <div className="moderation-info">
                    <small>
                      Moderowane {formatDate(comment.moderationTimestamp)}
                    </small>
                  </div>
                )}
                
                {comment.status === 'pending' && (
                  <div className="comment-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => handleApprove(comment._id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Zatwierdzanie...' : 'Zatwierdź'}
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => openRejectModal(comment)}
                      disabled={isSubmitting}
                    >
                      Odrzuć
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="pagination-btn"
              >
                Poprzednia
              </button>
              
              <span className="pagination-info">
                Strona {currentPage} z {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="pagination-btn"
              >
                Następna
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Rejection Modal */}
      {showRejectModal && selectedComment && (
        <div className="modal-backdrop">
          <div className="rejection-modal">
            <h3>Odrzuć komentarz</h3>
            <p>Czy na pewno chcesz odrzucić komentarz użytkownika <strong>{selectedComment.student?.name}</strong>?</p>
            
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
                disabled={isSubmitting}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={closeRejectModal}
                disabled={isSubmitting}
              >
                Anuluj
              </button>
              <button 
                className="confirm-reject-btn"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Odrzucanie...' : 'Odrzuć komentarz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentModeration;