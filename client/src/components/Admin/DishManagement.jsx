import React, { useState, useEffect, useCallback } from 'react';
import dishApi from '../../services/dishService';
import './DishManagement.css';

const DishManagement = () => {
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState = {
    _id: null,
    name: '',
    description: '',
    category: 'main', // Zgodnie z API
    allergens: [],
    dietaryInfo: [],
    // imageUrl: '' // Opcjonalne pole, jeśli API je obsługuje
  };
  const [formData, setFormData] = useState(initialFormState);

  // Funkcja do pobierania dań z serwera
  const fetchDishes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dishApi.getAll(); // Można dodać filtry, np. { limit: 100 }
      setDishes(response.dishes.sort((a,b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(`Nie udało się pobrać dań: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pobierz dane przy pierwszym załadowaniu komponentu
  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Specjalna obsługa dla pól, które mają być tablicami stringów
    if (name === 'allergens' || name === 'dietaryInfo') {
      const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
      setFormData({ ...formData, [name]: arrayValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddNewDish = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const handleEditDish = (dish) => {
    setIsEditing(true);
    setFormData({
      ...dish,
      // Konwertujemy tablice na stringi do edycji w polu tekstowym
      allergens: dish.allergens ? dish.allergens.join(', ') : '',
      dietaryInfo: dish.dietaryInfo ? dish.dietaryInfo.join(', ') : '',
    });
    setShowForm(true);
  };

  const handleDeleteDish = async (dishId) => {
    if (window.confirm('Czy na pewno chcesz usunąć to danie?')) {
      try {
        await dishApi.remove(dishId);
        alert('Danie zostało usunięte!');
        fetchDishes(); // Odśwież listę dań
        if (formData._id === dishId) {
            setShowForm(false); // Zamknij formularz, jeśli usunięto edytowane danie
        }
      } catch (err) {
        alert(`Błąd podczas usuwania: ${err.message}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) {
      alert('Nazwa dania i kategoria są wymagane.');
      return;
    }

    // Przygotuj dane do wysłania (konwersja stringów z powrotem na tablice)
    const dataToSend = {
      ...formData,
      allergens: typeof formData.allergens === 'string' ? formData.allergens.split(',').map(s => s.trim()).filter(Boolean) : formData.allergens,
      dietaryInfo: typeof formData.dietaryInfo === 'string' ? formData.dietaryInfo.split(',').map(s => s.trim()).filter(Boolean) : formData.dietaryInfo,
    }

    try {
      if (isEditing) {
        await dishApi.update(dataToSend._id, dataToSend);
        alert('Danie zostało zaktualizowane!');
      } else {
        await dishApi.create(dataToSend);
        alert('Danie zostało dodane!');
      }
      setShowForm(false);
      fetchDishes(); // Odśwież listę dań po każdej udanej operacji
    } catch (err) {
      alert(`Błąd: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const categories = ["danie główne", "zupa", "deser", "wegetariańskie", "dodatek", "napój"];
  const dietaryOptions = ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"];

  if (isLoading) return <p>Ładowanie dań...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="dish-management-container">
      <h2>Zarządzanie daniami</h2>

      {!showForm && (
        <button onClick={handleAddNewDish} className="add-new-dish-btn">
          Dodaj nowe danie
        </button>
      )}

      {showForm && (
        <div className="dish-form">
          <h3>{isEditing ? 'Edytuj danie' : 'Dodaj nowe danie'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nazwa dania:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Opis:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Kategoria:</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="imageUrl">URL obrazka:</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-dish-changes-btn">
                {isEditing ? 'Zapisz zmiany' : 'Dodaj danie'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-edit-btn">
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dish-list-container">
        <h3>Lista dań</h3>
        {dishes.length === 0 ? (
          <p className="no-dishes-message">Brak dań do wyświetlenia. Dodaj nowe danie.</p>
        ) : (
          <ul className="dish-list">
            {dishes.map(dish => (
              <li key={dish.id} className="dish-item-manage">
                <div className="dish-item-details">
                  <span className="dish-name">{dish.name}</span>
                  <span className="dish-category">Kategoria: {dish.category}</span>
                  {dish.description && (
                    <span className="dish-description-preview">
                      Opis: {dish.description.substring(0, 50)}{dish.description.length > 50 ? '...' : ''}
                    </span>
                  )}
                </div>
                <div className="dish-item-actions">
                  <button onClick={() => handleEditDish(dish)} className="edit-dish-btn">
                    Edytuj
                  </button>
                  <button onClick={() => handleDeleteDish(dish.id)} className="delete-dish-btn">
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DishManagement;