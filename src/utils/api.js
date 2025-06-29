// API utilities for connecting to Flask backend
const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// User API
export const userAPI = {
  getAllUsers: async () => {
    return await apiRequest('/users');
  },
  
  getUser: async (id) => {
    return await apiRequest(`/users/${id}`);
  },
  
  createUser: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: userData,
    });
  },
  
  updateUser: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  }
};

// Exercise API
export const exerciseAPI = {
  getAllExercises: async () => {
    return await apiRequest('/exercises');
  },
  
  getExercise: async (id) => {
    return await apiRequest(`/exercises/${id}`);
  },
  
  createExercise: async (exerciseData) => {
    return await apiRequest('/exercises', {
      method: 'POST',
      body: exerciseData,
    });
  },
  
  updateExercise: async (id, exerciseData) => {
    return await apiRequest(`/exercises/${id}`, {
      method: 'PUT',
      body: exerciseData,
    });
  },
  
  deleteExercise: async (id) => {
    return await apiRequest(`/exercises/${id}`, {
      method: 'DELETE',
    });
  }
};

// Workout API
export const workoutAPI = {
  getAllWorkouts: async (userId = null) => {
    const endpoint = userId ? `/workouts?user_id=${userId}` : '/workouts';
    return await apiRequest(endpoint);
  },
  
  getWorkout: async (id) => {
    return await apiRequest(`/workouts/${id}`);
  },
  
  createWorkout: async (workoutData) => {
    return await apiRequest('/workouts', {
      method: 'POST',
      body: workoutData,
    });
  },
  
  updateWorkout: async (id, workoutData) => {
    return await apiRequest(`/workouts/${id}`, {
      method: 'PUT',
      body: workoutData,
    });
  },
  
  deleteWorkout: async (id) => {
    return await apiRequest(`/workouts/${id}`, {
      method: 'DELETE',
    });
  }
};

// Workout Exercise API
export const workoutExerciseAPI = {
  getWorkoutExercises: async (workoutId) => {
    return await apiRequest(`/workout-exercises/${workoutId}`);
  },
  
  createWorkoutExercise: async (exerciseData) => {
    return await apiRequest('/workout-exercises', {
      method: 'POST',
      body: exerciseData,
    });
  },
  
  updateWorkoutExercise: async (id, exerciseData) => {
    return await apiRequest(`/workout-exercises/${id}`, {
      method: 'PUT',
      body: exerciseData,
    });
  },
  
  deleteWorkoutExercise: async (id) => {
    return await apiRequest(`/workout-exercises/${id}`, {
      method: 'DELETE',
    });
  }
};

// Health check
export const healthCheck = async () => {
  return await apiRequest('/health');
};