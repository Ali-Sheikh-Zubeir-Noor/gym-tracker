import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Award, BarChart3, Activity } from 'lucide-react';
import { userAPI, workoutAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Progress = () => {
  const [workouts, setWorkouts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('month'); // week, month, year

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user data
      const userData = await userAPI.getUser(1);
      setUser(userData);

      // Fetch workouts
      const workoutsData = await workoutAPI.getAllWorkouts(1);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Failed to load progress data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredWorkouts = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeframe) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setMonth(now.getMonth() - 1);
    }

    return workouts.filter(workout => new Date(workout.date) >= cutoffDate);
  };

  const calculateStats = () => {
    const filteredWorkouts = getFilteredWorkouts();
    const completedWorkouts = filteredWorkouts.filter(w => w.completed);
    
    const totalWorkouts = filteredWorkouts.length;
    const completedCount = completedWorkouts.length;
    const completionRate = totalWorkouts > 0 ? Math.round((completedCount / totalWorkouts) * 100) : 0;
    
    const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = completedCount > 0 ? Math.round(totalDuration / completedCount) : 0;
    
    const totalExercises = completedWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);
    
    return {
      totalWorkouts,
      completedCount,
      completionRate,
      avgDuration,
      totalExercises,
      totalDuration
    };
  };

  const getWorkoutsByWeek = () => {
    const filteredWorkouts = getFilteredWorkouts();
    const weeklyData = {};
    
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { completed: 0, total: 0 };
      }
      
      weeklyData[weekKey].total++;
      if (workout.completed) {
        weeklyData[weekKey].completed++;
      }
    });
    
    return Object.entries(weeklyData)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-8); // Last 8 weeks
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-white text-lg">Loading progress data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error Loading Progress"
        message={error}
        onRetry={fetchProgressData}
      />
    );
  }

  const stats = calculateStats();
  const weeklyData = getWorkoutsByWeek();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Progress Tracking</h1>
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeframe === period
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.completionRate}%</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Completed Workouts</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.completedCount}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Avg Duration</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.avgDuration}min</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Total Exercises</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalExercises}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Weekly Progress
        </h2>
        
        {weeklyData.length > 0 ? (
          <div className="space-y-4">
            {weeklyData.map(([week, data]) => {
              const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
              return (
                <div key={week} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      Week of {new Date(week).toLocaleDateString()}
                    </span>
                    <span className="text-white">
                      {data.completed}/{data.total} workouts ({Math.round(completionRate)}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No data available</h3>
            <p className="text-gray-400">Complete some workouts to see your progress!</p>
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Recent Activity
        </h2>
        
        {workouts.filter(w => w.completed).slice(0, 5).length > 0 ? (
          <div className="space-y-4">
            {workouts
              .filter(w => w.completed)
              .sort((a, b) => new Date(b.completed_date || b.date) - new Date(a.completed_date || a.date))
              .slice(0, 5)
              .map((workout) => (
                <div key={workout.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                  <div>
                    <h3 className="font-medium text-white">{workout.name}</h3>
                    <p className="text-gray-300 text-sm">
                      Completed on {new Date(workout.completed_date || workout.date).toLocaleDateString()}
                      {workout.duration && ` • ${workout.duration} minutes`}
                    </p>
                  </div>
                  <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                    Completed
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No completed workouts</h3>
            <p className="text-gray-400">Start completing workouts to track your progress!</p>
          </div>
        )}
      </div>

      {/* Goals & Recommendations */}
      {user && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6">Goals & Recommendations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="font-medium text-white mb-2">Current Goal</h3>
              <p className="text-purple-300 font-semibold">{user.goal}</p>
              <p className="text-gray-300 text-sm mt-2">
                {stats.completionRate >= 80 
                  ? "Excellent progress! Keep up the great work."
                  : stats.completionRate >= 60
                  ? "Good progress! Try to be more consistent."
                  : "Focus on consistency to reach your goals."}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="font-medium text-white mb-2">Next Milestone</h3>
              <p className="text-blue-300 font-semibold">
                {stats.completedCount < 10 
                  ? "Complete 10 workouts"
                  : stats.completedCount < 25
                  ? "Complete 25 workouts"
                  : "Complete 50 workouts"}
              </p>
              <p className="text-gray-300 text-sm mt-2">
                {stats.completedCount < 10 
                  ? `${10 - stats.completedCount} workouts to go!`
                  : stats.completedCount < 25
                  ? `${25 - stats.completedCount} workouts to go!`
                  : `${50 - stats.completedCount} workouts to go!`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;