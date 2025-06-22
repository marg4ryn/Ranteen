import React, { useState, useEffect } from 'react';
import adminApi from '../../services/AuthApi';
import Spinner from '../Layout/Spinner';
import './UserVerification.css';

const UserVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        setLoading(true);
        const pendingUsers = await adminApi.getPendingUsers();
        setUsers(pendingUsers);
        setError(null);
      } catch (err) {
        setError('Nie udało się pobrać listy użytkowników. Spróbuj ponownie później.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleApprove = async (userId) => {
    try {
      await adminApi.approveUser(userId);
      setUsers(currentUsers => currentUsers.filter(user => user._id !== userId));
    } catch (err) {
      alert('Wystąpił błąd podczas zatwierdzania użytkownika.');
    }
  };
  
  // Obsługa odrzucenia użytkownika
  const handleReject = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.rejectUser(selectedUser._id, rejectionReason);
      setUsers(currentUsers => currentUsers.filter(user => user._id !== selectedUser._id));
      closeModal();
    } catch (err) {
      alert('Wystąpił błąd podczas odrzucania użytkownika.');
    }
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setShowRejectModal(true);
  };

  const closeModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedUser(null);
  };
  
  if (loading) return <Spinner />;
  if (error) return <div className="error-message">{error}</div>;

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
                <th>Data rejestracji</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td className="user-info-cell">
                    <img 
                      src={user.profilePictureUrl || `https://via.placeholder.com/40?text=${user.name.charAt(0)}`} 
                      alt={user.name} 
                      className="user-avatar" 
                    />
                    <span>{user.name}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="actions-cell">
                    <button 
                      className="approve-btn"
                      onClick={() => handleApprove(user._id)}
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
              <button className="cancel-btn" onClick={closeModal}>Anuluj</button>
              <button className="confirm-reject-btn" onClick={handleReject}>Odrzuć konto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVerification;