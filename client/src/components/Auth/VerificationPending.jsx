import React from 'react';
import './VerificationPending.css';

const VerificationPending = () => {
  return (
    <div className="verification-pending-container">
      <div className="verification-card">
        <h2>Weryfikacja konta w toku</h2>
        <div className="verification-icon">
          <i className="fas fa-clock"></i>
        </div>
        <p>
          Twoje konto oczekuje na weryfikację przez administratora. 
          Po zweryfikacji będziesz mógł/mogła oceniać i komentować dania.
        </p>
        <p>
          Zazwyczaj proces weryfikacji trwa do 24 godzin w dni robocze.
        </p>
        <button className="refresh-button">Odśwież status</button>
      </div>
    </div>
  );
};

export default VerificationPending;