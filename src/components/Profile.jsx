import React, { useState } from 'react';
import { User, Edit, Save, X, Target, Calendar, Weight, Ruler } from 'lucide-react';

const Profile = ({ userProfile, setUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);

  const handleSave = () => {
    setUserProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const goals = [
    'Build Muscle',
    'Lose Weight',
    'Increase Strength',
    'Improve Endurance',
    'General Fitness',
    'Athletic Performance'
  ];

  const calculateBMI = () => {
    const heightInMeters = userProfile.height / 100;
    const bmi = userProfile.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-400' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-400' };
    return { category: 'Obese', color: 'text-red-400' };
  };

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(parseFloat(bmi));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500/20 text-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-500/30 transition-all duration-200"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-6 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
            <User className="h-12 w-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{userProfile.name}</h3>
            <p className="text-gray-300">{userProfile.goal}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age
              </label>
              <input
                type="number"
                value={editedProfile.age}
                onChange={(e) => setEditedProfile({ ...editedProfile, age: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={editedProfile.weight}
                onChange={(e) => setEditedProfile({ ...editedProfile, weight: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={editedProfile.height}
                onChange={(e) => setEditedProfile({ ...editedProfile, height: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fitness Goal
              </label>
              <select
                value={editedProfile.goal}
                onChange={(e) => setEditedProfile({ ...editedProfile, goal: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {goals.map(goal => (
                  <option key={goal} value={goal} className="bg-gray-800">
                    {goal}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-gray-300 text-sm">Age</p>
                  <p className="text-white font-semibold">{userProfile.age} years</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <Weight className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-gray-300 text-sm">Weight</p>
                  <p className="text-white font-semibold">{userProfile.weight} kg</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <Ruler className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-gray-300 text-sm">Height</p>
                  <p className="text-white font-semibold">{userProfile.height} cm</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-gray-300 text-sm">Goal</p>
                  <p className="text-white font-semibold text-xs">{userProfile.goal}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Health Metrics */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Health Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <h4 className="text-lg font-semibold text-white mb-2">BMI</h4>
            <p className="text-3xl font-bold text-white mb-1">{bmi}</p>
            <p className={`text-sm font-medium ${bmiInfo.color}`}>{bmiInfo.category}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <h4 className="text-lg font-semibold text-white mb-2">Ideal Weight Range</h4>
            <p className="text-lg font-bold text-white mb-1">
              {Math.round(18.5 * Math.pow(userProfile.height / 100, 2))} - {Math.round(24.9 * Math.pow(userProfile.height / 100, 2))} kg
            </p>
            <p className="text-sm text-gray-300">Based on BMI 18.5-24.9</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <h4 className="text-lg font-semibold text-white mb-2">Daily Calories</h4>
            <p className="text-lg font-bold text-white mb-1">
              {Math.round(88.362 + (13.397 * userProfile.weight) + (4.799 * userProfile.height) - (5.677 * userProfile.age))} kcal
            </p>
            <p className="text-sm text-gray-300">Estimated BMR</p>
          </div>
        </div>
      </div>

      {/* Fitness Goals */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Fitness Journey</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <h4 className="font-medium text-white">Current Goal</h4>
              <p className="text-gray-300 text-sm">{userProfile.goal}</p>
            </div>
            <Target className="h-6 w-6 text-purple-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="font-medium text-white mb-2">Recommended Workout Frequency</h4>
              <p className="text-gray-300 text-sm">
                {userProfile.goal === 'Build Muscle' ? '4-5 times per week' :
                 userProfile.goal === 'Lose Weight' ? '5-6 times per week' :
                 userProfile.goal === 'Increase Strength' ? '3-4 times per week' :
                 userProfile.goal === 'Improve Endurance' ? '4-6 times per week' :
                 '3-4 times per week'}
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="font-medium text-white mb-2">Focus Areas</h4>
              <p className="text-gray-300 text-sm">
                {userProfile.goal === 'Build Muscle' ? 'Progressive overload, compound movements' :
                 userProfile.goal === 'Lose Weight' ? 'Cardio, high-intensity training' :
                 userProfile.goal === 'Increase Strength' ? 'Heavy lifting, low reps' :
                 userProfile.goal === 'Improve Endurance' ? 'Cardio, circuit training' :
                 'Balanced strength and cardio'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;