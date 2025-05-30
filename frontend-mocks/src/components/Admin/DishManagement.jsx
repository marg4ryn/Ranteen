import React, { useState, useEffect } from 'react';
import { mockDishes as initialMockDishes } from '../../data/mockDishes'; // Assuming mockDishes path
import './DishManagement.css';

// Helper to generate a somewhat unique ID
const generateId = () => `dish-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const DishManagement = () => {
  const [dishes, setDishes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDish, setCurrentDish] = useState(null); // Stores the dish being edited

  const initialFormState = {
    id: '',
    name: '',
    description: '',
    category: 'Danie główne', // Default category
    imageUrl: '',
    // averageRating and comments are usually managed by other processes (e.g., user reviews)
    // For simplicity, we won't manage them directly in this CRUD form.
  };
  const [formData, setFormData] = useState(initialFormState);

  // Load initial dishes (e.g., from mock data or an API call in a real app)
  useEffect(() => {
    // Make a deep copy to avoid mutating the original mockDishes if it's used elsewhere
    setDishes(JSON.parse(JSON.stringify(initialMockDishes)));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddNewDish = () => {
    setIsEditing(false);
    setCurrentDish(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const handleEditDish = (dish) => {
    setIsEditing(true);
    setCurrentDish(dish);
    setFormData({
      id: dish.id,
      name: dish.name,
      description: dish.description,
      category: dish.category,
      imageUrl: dish.imageUrl || '', // Handle cases where imageUrl might be undefined
    });
    setShowForm(true);
  };

  const handleDeleteDish = (dishId) => {
    if (window.confirm('Czy na pewno chcesz usunąć to danie?')) {
      setDishes(dishes.filter(dish => dish.id !== dishId));
      // If the deleted dish was being edited, close the form
      if (currentDish && currentDish.id === dishId) {
        setShowForm(false);
        setCurrentDish(null);
        setIsEditing(false);
      }
      alert('Danie zostało usunięte!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) {
      alert('Nazwa dania i kategoria są wymagane.');
      return;
    }

    if (isEditing && currentDish) {
      // Update existing dish
      const updatedDishes = dishes.map(dish =>
        dish.id === currentDish.id ? { ...dish, ...formData } : dish
      );
      setDishes(updatedDishes);
      alert('Danie zostało zaktualizowane!');
    } else {
      // Add new dish
      const newDish = {
        ...formData,
        id: generateId(),
        // For new dishes, we might initialize averageRating and comments if needed
        averageRating: 0,
        comments: [],
      };
      setDishes([...dishes, newDish].sort((a,b) => a.name.localeCompare(b.name))); // Keep sorted
      alert('Danie zostało dodane!');
    }
    setShowForm(false);
    setFormData(initialFormState);
    setCurrentDish(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setCurrentDish(null);
    setIsEditing(false);
  };

  // Available categories - you might want to fetch this from a config or derive it
  const categories = ["Danie główne", "Zupa", "Przystawka", "Deser", "Napój"];


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