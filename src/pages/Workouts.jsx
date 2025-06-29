import React, { useState, useEffect } from 'react';
import { Plus, Play, Trash2, Check, Calendar, Clock } from 'lucide-react';
import WorkoutForm from '../components/WorkoutForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { workoutAPI, exerciseAPI } from '../utils/api';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [workoutsData, exercisesData] = await Promise.all([
        workoutAPI.getAllWorkouts(1), // Assuming user ID 1
        exerciseAPI.getAllExercises()
      ]);
      
      setWorkouts(workoutsData);
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load workouts and exercises. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkout = async (workoutData) => {
    try {
      await workoutAPI.createWorkout({ ...workoutData, user_id: 1 });
      await fetchData();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to create workout. Please try again.');
    }
  };

  const handleUpdateWorkout = async (workoutId, updates) => {
    try {
      await workoutAPI.updateWorkout(workoutId, updates);
      await fetchData();
      if (updates.completed) {
        setActiveWorkout(null);
      }
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to update workout. Please try again.');
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutAPI.deleteWorkout(workoutId);
        await fetchData();
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Failed to delete workout. Please try again.');
      }
    }
  };

  const startWorkout = (workout) => {
    setActiveWorkout(workout);
  };

  const completeWorkout = (workoutId) => {
    handleUpdateWorkout(workoutId, {
      completed: true,
      completed_date: new Date().toISOString(),
      duration: 60 // Default duration in minutes
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-white text-lg">Loading workouts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error Loading Workouts"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Workouts</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>New Workout</span>
        </button>
      </div>

      {/* Active Workout */}
      {activeWorkout && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Active: {activeWorkout.name}
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={() => completeWorkout(activeWorkout.id)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
              >
                <Check className="h-4 w-4" />
                <span>Complete</span>
              </button>
              <button
                onClick={() => setActiveWorkout(null)}
                className="bg-gray-500/20 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition-all duration-200"
              >
                Stop
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {activeWorkout.exercises?.map((exercise, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">{exercise.name}</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Sets:</span>
                    <span className="text-white ml-2">{exercise.sets}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Reps:</span>
                    <span className="text-white ml-2">{exercise.reps}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Weight:</span>
                    <span className="text-white ml-2">{exercise.weight || 0}kg</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Rest:</span>
                    <span className="text-white ml-2">{exercise.rest_time || 60}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workout Form */}
      {showForm && (
        <WorkoutForm
          exercises={exercises}
          onSubmit={handleCreateWorkout}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((workout) => (
          <div key={workout.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-lg">{workout.name}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(workout.date).toLocaleDateString()}</span>
                  </div>
                  {workout.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{workout.duration}min</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {workout.exercises?.length || 0} exercises
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                workout.completed 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {workout.completed ? 'Completed' : 'Pending'}
              </div>
            </div>

            {workout.notes && (
              <p className="text-gray-300 text-sm mb-4 italic">"{workout.notes}"</p>
            )}

            <div className="flex space-x-2">
              {!workout.completed && (
                <button
                  onClick={() => startWorkout(workout)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-200"
                >
                  <Play className="h-4 w-4" />
                  <span>Start</span>
                </button>
              )}
              
              <button
                onClick={() => handleDeleteWorkout(workout.id)}
                className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {workouts.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="bg-white/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">No workouts yet</h2>
          <p className="text-gray-400 mb-6">Create your first workout to get started on your fitness journey!</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Create Your First Workout
          </button>
        </div>
      )}
    </div>
  );
};

export default Workouts;