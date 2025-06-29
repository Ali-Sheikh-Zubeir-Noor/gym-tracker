import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, Target, Award, Flame, Activity, Plus, BarChart3 } from 'lucide-react';
import { userAPI, workoutAPI, exerciseAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    thisWeekWorkouts: 0,
    totalExercises: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user data (assuming user ID 1 for demo)
      const userData = await userAPI.getUser(1);
      setUser(userData);

      // Fetch workouts
      const workoutsData = await workoutAPI.getAllWorkouts(1);
      
      // Calculate stats
      const completed = workoutsData.filter(w => w.completed);
      const thisWeek = workoutsData.filter(w => {
        const workoutDate = new Date(w.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return workoutDate >= weekAgo;
      });

      setStats({
        totalWorkouts: workoutsData.length,
        completedWorkouts: completed.length,
        thisWeekWorkouts: thisWeek.length,
        totalExercises: workoutsData.reduce((total, w) => total + (w.exercises?.length || 0), 0)
      });

      setRecentWorkouts(workoutsData.slice(0, 5));

      // Fetch exercises count
      const exercisesData = await exerciseAPI.getAllExercises();
      setStats(prev => ({ ...prev, totalExercises: exercisesData.length }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Workouts',
      value: stats.totalWorkouts,
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'This Week',
      value: stats.thisWeekWorkouts,
      icon: Flame,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Completed',
      value: stats.completedWorkouts,
      icon: Award,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Total Exercises',
      value: stats.totalExercises,
      icon: Activity,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-white text-lg">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error Loading Dashboard"
        message={error}
        onRetry={fetchDashboardData}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back{user ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-purple-100 text-lg">Ready to crush your fitness goals today?</p>
        {user && (
          <div className="mt-6 flex items-center space-x-6 text-sm">
            <span className="bg-white/20 px-4 py-2 rounded-full">
              Goal: {user.goal}
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full">
              Weight: {user.weight}kg
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full">
              Height: {user.height}cm
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Workouts */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Recent Workouts
        </h2>
        
        {recentWorkouts.length > 0 ? (
          <div className="space-y-4">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between py-4 border-b border-white/10 last:border-b-0">
                <div>
                  <h3 className="font-medium text-white">{workout.name}</h3>
                  <p className="text-gray-300 text-sm">
                    {new Date(workout.date).toLocaleDateString()} • {workout.exercises?.length || 0} exercises
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No workouts yet</h3>
            <p className="text-gray-400">Create your first workout to get started!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Start</h3>
          <p className="text-gray-300 mb-4">Ready to work out? Start a new session now.</p>
          <Link 
            to="/workouts"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 w-full inline-block text-center"
          >
            Start New Workout
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Progress Tracking</h3>
          <p className="text-gray-300 mb-4">View your fitness journey and achievements.</p>
          <Link 
            to="/progress"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 w-full inline-block text-center"
          >
            View Progress
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;