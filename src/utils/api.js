// API utilities for connecting to Flask backend
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://fitness-tracker-backend-v6nm.onrender.com/api' // Your actual Render URL
  : 'http://localhost:5000/api';

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
    
    // In production, fall back to localStorage if backend is unavailable
    if (import.meta.env.PROD) {
      return handleOfflineMode(endpoint, options);
    }
    
    throw error;
  }
};

// Offline mode using localStorage for production deployment
const handleOfflineMode = async (endpoint, options) => {
  const { initializeStorage, getUsers, getUser, updateUser, getExercises, createExercise, updateExercise, deleteExercise, getWorkouts, createWorkout, updateWorkout, deleteWorkout } = await import('./localStorage.js');
  
  // Initialize storage on first use
  initializeStorage();
  
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;
  
  // Route the request to appropriate localStorage function
  if (endpoint.startsWith('/users')) {
    if (method === 'GET') {
      if (endpoint === '/users') {
        return getUsers();
      } else {
        const id = endpoint.split('/')[2];
        return getUser(id);
      }
    } else if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      return updateUser(id, body);
    }
  } else if (endpoint.startsWith('/exercises')) {
    if (method === 'GET') {
      return getExercises();
    } else if (method === 'POST') {
      return createExercise(body);
    } else if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      return updateExercise(id, body);
    } else if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      deleteExercise(id);
      return { message: 'Exercise deleted successfully' };
    }
  } else if (endpoint.startsWith('/workouts')) {
    if (method === 'GET') {
      const urlParams = new URLSearchParams(endpoint.split('?')[1]);
      const userId = urlParams.get('user_id');
      return getWorkouts(userId);
    } else if (method === 'POST') {
      return createWorkout(body);
    } else if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      return updateWorkout(id, body);
    } else if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      deleteWorkout(id);
      return { message: 'Workout deleted successfully' };
    }
  }
  
  throw new Error('Endpoint not supported in offline mode');
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