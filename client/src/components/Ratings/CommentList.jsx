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
            <li key={comment.id} className={`comment ${comment.status.toLowerCase()}`}>
              <div className="comment-header">
                <div className="comment-author">
                  <img 
                    src={comment.user.avatar || 'https://via.placeholder.com/40'} 
                    alt={comment.user.name} 
                    className="author-avatar" 
                  />
                  <span className="author-name">{comment.user.name}</span>
                </div>
                <div className="comment-meta">
                  <span className="comment-date">{formatDate(comment.date)}</span>
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