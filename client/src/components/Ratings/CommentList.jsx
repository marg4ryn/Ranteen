import React from 'react';
import './CommentList.css';

const CommentList = ({ comments }) => {
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
  
  
  return (
    <div className="comment-list">
      <h4>Komentarze ({comments.length})</h4>
      
      {comments.length === 0 ? (
        <p className="no-comments">Brak komentarzy. Bądź pierwszy!</p>
      ) : (
        <ul>
          {comments.map(comment => (
            <li key={comment._id} className={`comment ${comment.status.toLowerCase()}`}>
              <div className="comment-header">
                <div className="comment-author">
                  <img 
                    src={comment.student?.profilePictureUrl || 'https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg'} 
                    alt={comment.student?.name || 'Użytkownik'} 
                    className="author-avatar" 
                  />
                  <span className="author-name">{comment.student?.name || 'Anonimowy użytkownik'}</span>
                </div>
                <div className="comment-meta">
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  {comment.status === 'pending' && (
                    <span className="status-badge pending">Oczekuje moderacji</span>
                  )}
                  {comment.status === 'approved' && (
                    <span className="status-badge approved">Zatwierdzony</span>
                  )}
                  {comment.status === 'rejected' && (
                    <span className="status-badge rejected">Odrzucony</span>
                  )}
                </div>
              </div>
              <div className="comment-body">
                <p>{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentList;