import React from 'react';
import { TrendingUp, Calendar, Target, Award, BarChart3, Activity } from 'lucide-react';

const Progress = ({ workouts, userProfile }) => {
  const completedWorkouts = workouts.filter(workout => workout.completed);
  const totalWorkouts = workouts.length;
  const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts.length / totalWorkouts) * 100) : 0;

  // Calculate weekly progress
  const getWeeklyData = () => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekWorkouts = completedWorkouts.filter(workout => {
        const workoutDate = new Date(workout.completedDate || workout.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });
      
      weeks.push({
        week: `Week ${i === 0 ? 'Current' : i + 1}`,
        workouts: weekWorkouts.length,
        date: weekStart.toLocaleDateString()
      });
    }
    
    return weeks;
  };

  const weeklyData = getWeeklyData();
  const maxWeeklyWorkouts = Math.max(...weeklyData.map(w => w.workouts), 1);

  // Calculate muscle group frequency
  const getMuscleGroupStats = () => {
    const muscleGroups = {};
    
    completedWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        exercise.muscleGroups?.forEach(muscle => {
          muscleGroups[muscle] = (muscleGroups[muscle] || 0) + 1;
        });
      });
    });
    
    return Object.entries(muscleGroups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);
  };

  const muscleGroupStats = getMuscleGroupStats();

  // Calculate total volume (sets × reps × weight)
  const getTotalVolume = () => {
    return completedWorkouts.reduce((total, workout) => {
      return total + (workout.exercises?.reduce((workoutTotal, exercise) => {
        return workoutTotal + (exercise.sets?.reduce((setTotal, set) => {
          return setTotal + (set.reps * set.weight);
        }, 0) || 0);
      }, 0) || 0);
    }, 0);
  };

  const totalVolume = getTotalVolume();

  const stats = [
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: Target,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Total Volume',
      value: `${totalVolume.toLocaleString()}kg`,
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Completed Workouts',
      value: completedWorkouts.length,
      icon: Award,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'This Week',
      value: weeklyData[6]?.workouts || 0,
      icon: Activity,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Progress Tracking</h2>
        <div className="text-sm text-gray-300">
          Goal: {userProfile.goal}
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
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Weekly Progress
        </h3>
        
        <div className="space-y-4">
          {weeklyData.map((week, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-300">
                {week.week === 'Week Current' ? 'This Week' : week.date}
              </div>
              <div className="flex-1 bg-white/5 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(week.workouts / maxWeeklyWorkouts) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {week.workouts} workout{week.workouts !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Muscle Group Distribution */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Muscle Group Focus
        </h3>
        
        {muscleGroupStats.length > 0 ? (
          <div className="space-y-4">
            {muscleGroupStats.map(([muscle, count], index) => {
              const maxCount = muscleGroupStats[0][1];
              const percentage = (count / maxCount) * 100;
              
              return (
                <div key={muscle} className="flex items-center space-x-4">
                  <div className="w-24 text-sm text-gray-300">{muscle}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-300 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No muscle group data yet</p>
            <p className="text-gray-400 text-sm">Complete some workouts to see your focus areas</p>
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Recent Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completionRate >= 80 && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 p-2 rounded-full">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Consistency Master</h4>
                  <p className="text-sm text-green-300">80%+ completion rate</p>
                </div>
              </div>
            </div>
          )}
          
          {completedWorkouts.length >= 10 && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Workout Warrior</h4>
                  <p className="text-sm text-purple-300">10+ completed workouts</p>
                </div>
              </div>
            </div>
          )}
          
          {totalVolume >= 1000 && (
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-full">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Volume Victor</h4>
                  <p className="text-sm text-blue-300">1000kg+ total volume</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {completionRate < 80 && completedWorkouts.length < 10 && totalVolume < 1000 && (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">Keep working to unlock achievements!</p>
            <p className="text-gray-400 text-sm">Complete more workouts to earn badges</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;