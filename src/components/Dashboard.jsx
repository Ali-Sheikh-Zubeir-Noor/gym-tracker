import React from 'react';
import { Calendar, TrendingUp, Target, Clock, Flame, Award } from 'lucide-react';

const Dashboard = ({ workouts, userProfile }) => {
  const today = new Date().toDateString();
  const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const todaysWorkouts = workouts.filter(workout => 
    new Date(workout.date).toDateString() === today
  );
  
  const weeklyWorkouts = workouts.filter(workout => 
    new Date(workout.date) >= thisWeek
  );
  
  const completedWorkouts = workouts.filter(workout => workout.completed);
  const totalSets = workouts.reduce((total, workout) => 
    total + (workout.exercises?.reduce((setTotal, exercise) => 
      setTotal + (exercise.sets?.length || 0), 0) || 0), 0
  );

  const stats = [
    {
      title: 'Total Workouts',
      value: workouts.length,
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'This Week',
      value: weeklyWorkouts.length,
      icon: Flame,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Completed',
      value: completedWorkouts.length,
      icon: Award,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Total Sets',
      value: totalSets,
      icon: Target,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const recentWorkouts = workouts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {userProfile.name}!</h2>
        <p className="text-purple-100">Ready to crush your fitness goals today?</p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">Goal: {userProfile.goal}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">Weight: {userProfile.weight}kg</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Workouts */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Today's Workouts
        </h3>
        {todaysWorkouts.length > 0 ? (
          <div className="space-y-3">
            {todaysWorkouts.map((workout) => (
              <div key={workout.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{workout.name}</h4>
                    <p className="text-gray-300 text-sm">
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No workouts scheduled for today</p>
            <p className="text-gray-400 text-sm">Plan a workout to get started!</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Recent Activity
        </h3>
        {recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                <div>
                  <h4 className="font-medium text-white">{workout.name}</h4>
                  <p className="text-gray-300 text-sm">
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  workout.completed 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {workout.completed ? 'Completed' : 'Incomplete'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No recent activity</p>
            <p className="text-gray-400 text-sm">Start your first workout!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;