import React, { useState } from 'react';
import './UserVerification.css';

// Mock data for pending users
const pendingUsers = [
  {
    id: '101',
    name: 'Marta Kowalczyk',
    email: 'marta.kowalczyk@szkola.edu.pl',
    class: '2A',
    classNumber: 8,
    googleId: 'google101',
    registrationDate: '2023-11-01T10:15:00',
    avatar: 'https://via.placeholder.com/40?text=MK'
  },
  {
    id: '102',
    name: 'Tomasz Zieliński',
    email: 'tomasz.zielinski@szkola.edu.pl',
    class: '3C',
    classNumber: 14,
    googleId: 'google102',
    registrationDate: '2023-11-02T09:30:00',
    avatar: 'https://via.placeholder.com/40?text=TZ'
  },
  {
    id: '103',
    name: 'Karolina Dąbrowska',
    email: 'karolina.dabrowska@szkola.edu.pl',
    class: '1B',
    classNumber: 5,
    googleId: 'google103',
    registrationDate: '2023-11-03T11:45:00',
    avatar: 'https://via.placeholder.com/40?text=KD'
  }
];

const UserVerification = () => {
  const [users, setUsers] = useState(pendingUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
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
  
  // Handle user approval
  const handleApprove = (userId) => {
    // In a real app, this would call an API
    setUsers(users.filter(user => user.id !== userId));
  };
  
  // Open rejection modal
  const openRejectModal = (user) => {
    setSelectedUser(user);
    setShowRejectModal(true);
  };
  
  // Handle user rejection
  const handleReject = () => {
    // In a real app, this would call an API with the rejection reason
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedUser(null);
  };
  
  return (
    <div className="user-verification-container">
      <h2>Weryfikacja użytkowników</h2>
      
      {users.length === 0 ? (
        <div className="no-pending-users">
          <p>Brak użytkowników oczekujących na weryfikację.</p>
        </div>
      ) : (
        <div className="pending-users-list">
          <h3>Użytkownicy oczekujący na weryfikację ({users.length})</h3>
          
          <table className="users-table">
            <thead>
              <tr>
                <th>Użytkownik</th>
                <th>Email</th>
                <th>Klasa</th>
                <th>Data rejestracji</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="user-info-cell">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="user-avatar" 
                    />
                    <span>{user.name}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.class} (nr {user.classNumber})</td>
                  <td>{formatDate(user.registrationDate)}</td>
                  <td className="actions-cell">
                    <button 
                      className="approve-btn"
                      onClick={() => handleApprove(user.id)}
                    >
                      Zatwierdź
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => openRejectModal(user)}
                    >
                      Odrzuć
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Rejection Modal */}
      {showRejectModal && selectedUser && (
        <div className="modal-backdrop">
          <div className="rejection-modal">
            <h3>Odrzuć użytkownika</h3>
            <p>Czy na pewno chcesz odrzucić konto użytkownika <strong>{selectedUser.name}</strong>?</p>
            
            <div className="form-group">
              <label htmlFor="rejection-reason">Powód odrzucenia (opcjonalnie):</label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Podaj powód odrzucenia konta..."
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
                Odrzuć konto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVerification;