import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Dumbbell, Target, Edit, Trash2 } from 'lucide-react';
import ExerciseForm from '../components/ExerciseForm';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedCategory]);

  const fetchExercises = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/exercises');
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    setFilteredExercises(filtered);
  };

  const handleCreateExercise = async (exerciseData) => {
    try {
      const response = await fetch('http://localhost:5000/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
      });

      if (response.ok) {
        fetchExercises();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
    }
  };

  const handleUpdateExercise = async (exerciseId, exerciseData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
      });

      if (response.ok) {
        fetchExercises();
        setEditingExercise(null);
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/exercises/${exerciseId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchExercises();
        }
      } catch (error) {
        console.error('Error deleting exercise:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Exercise Library</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search exercises..."
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/5 border border-white/20 rounded-lg pl-10 pr-8 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none min-w-[150px]"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercise Form */}
      {(showForm || editingExercise) && (
        <ExerciseForm
          initialValues={editingExercise}
          onSubmit={editingExercise 
            ? (data) => handleUpdateExercise(editingExercise.id, data)
            : handleCreateExercise
          }
          onCancel={() => {
            setShowForm(false);
            setEditingExercise(null);
          }}
        />
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => {
          let muscleGroups = [];
          try {
            muscleGroups = JSON.parse(exercise.muscle_groups || '[]');
          } catch (e) {
            muscleGroups = [];
          }

          return (
            <div key={exercise.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingExercise(exercise)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-white text-lg mb-2">{exercise.name}</h3>
                <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {exercise.category}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Target className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Muscle Groups:</p>
                    <p className="text-sm text-gray-300">
                      {muscleGroups.length > 0 ? muscleGroups.join(', ') : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                {exercise.equipment && (
                  <div className="flex items-start space-x-2">
                    <Dumbbell className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Equipment:</p>
                      <p className="text-sm text-gray-300">{exercise.equipment}</p>
                    </div>
                  </div>
                )}

                {exercise.instructions && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Instructions:</p>
                    <p className="text-sm text-gray-300">{exercise.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">No exercises found</h2>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedCategory !== 'All' 
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first exercise to get started!'
            }
          </p>
          {!searchTerm && selectedCategory === 'All' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Add Your First Exercise
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Exercises;