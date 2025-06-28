import React, { useState } from 'react';
import { Plus, Search, Filter, Dumbbell, Target } from 'lucide-react';

const ExerciseLibrary = ({ exercises, onAddExercise }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newExercise, setNewExercise] = useState({
    name: '',
    category: '',
    muscleGroups: [],
    equipment: ''
  });

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
  const muscleGroupOptions = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Obliques'
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddExercise = () => {
    if (newExercise.name.trim() && newExercise.category && newExercise.muscleGroups.length > 0) {
      onAddExercise(newExercise);
      setNewExercise({
        name: '',
        category: '',
        muscleGroups: [],
        equipment: ''
      });
      setShowAddForm(false);
    }
  };

  const toggleMuscleGroup = (muscleGroup) => {
    setNewExercise({
      ...newExercise,
      muscleGroups: newExercise.muscleGroups.includes(muscleGroup)
        ? newExercise.muscleGroups.filter(mg => mg !== muscleGroup)
        : [...newExercise.muscleGroups, muscleGroup]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Exercise Library</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search exercises..."
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/5 border border-white/20 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
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

      {/* Add Exercise Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Exercise</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exercise Name
              </label>
              <input
                type="text"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter exercise name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={newExercise.category}
                onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-gray-800">Select category</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category} className="bg-gray-800">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Equipment
              </label>
              <input
                type="text"
                value={newExercise.equipment}
                onChange={(e) => setNewExercise({ ...newExercise, equipment: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Barbell, Dumbbells"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Muscle Groups
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {muscleGroupOptions.map(muscleGroup => (
                  <label key={muscleGroup} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newExercise.muscleGroups.includes(muscleGroup)}
                      onChange={() => toggleMuscleGroup(muscleGroup)}
                      className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">{muscleGroup}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleAddExercise}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Add Exercise
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewExercise({
                  name: '',
                  category: '',
                  muscleGroups: [],
                  equipment: ''
                });
              }}
              className="bg-gray-500/20 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <div key={exercise.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="bg-white/10 text-gray-300 px-2 py-1 rounded-full text-xs">
                {exercise.category}
              </span>
            </div>
            
            <h3 className="font-semibold text-white mb-2">{exercise.name}</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {exercise.muscleGroups.join(', ')}
                </span>
              </div>
              
              {exercise.equipment && (
                <div className="flex items-center space-x-2">
                  <Dumbbell className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{exercise.equipment}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No exercises found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;