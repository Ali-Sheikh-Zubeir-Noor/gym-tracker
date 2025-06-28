import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User, Edit, Save, X, Target, Calendar, Weight, Ruler } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/1');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email format'),
    age: Yup.number()
      .required('Age is required')
      .min(13, 'Must be at least 13 years old')
      .max(120, 'Age must be realistic'),
    weight: Yup.number()
      .required('Weight is required')
      .min(20, 'Weight must be at least 20kg')
      .max(300, 'Weight must be less than 300kg'),
    height: Yup.number()
      .required('Height is required')
      .min(100, 'Height must be at least 100cm')
      .max(250, 'Height must be less than 250cm'),
    goal: Yup.string()
      .required('Goal is required')
  });

  const goals = [
    'Build Muscle',
    'Lose Weight',
    'Increase Strength',
    'Improve Endurance',
    'General Fitness',
    'Athletic Performance'
  ];

  const handleUpdateProfile = async (values) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setUser(values);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const calculateBMI = () => {
    if (!user || !user.weight || !user.height) return 0;
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-400' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-400' };
    return { category: 'Obese', color: 'text-red-400' };
  };

  const calculateBMR = () => {
    if (!user || !user.weight || !user.height || !user.age) return 0;
    // Mifflin-St Jeor Equation (assuming male for simplicity)
    return Math.round(88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age));
  };

  const calculateIdealWeight = () => {
    if (!user || !user.height) return { min: 0, max: 0 };
    const heightInMeters = user.height / 100;
    return {
      min: Math.round(18.5 * Math.pow(heightInMeters, 2)),
      max: Math.round(24.9 * Math.pow(heightInMeters, 2))
    };
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmiInfo = getBMICategory(parseFloat(bmi));
  const bmr = calculateBMR();
  const idealWeight = calculateIdealWeight();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
          >
            <Edit className="h-5 w-5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        <div className="flex items-center space-x-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
            <User className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-gray-300">{user.email}</p>
            <p className="text-purple-300">{user.goal}</p>
          </div>
        </div>

        {isEditing ? (
          <Formik
            initialValues={user}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleUpdateProfile(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <Field
                      name="name"
                      type="text"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-400 text-sm mt-1" />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-400 text-sm mt-1" />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Age *
                    </label>
                    <Field
                      name="age"
                      type="number"
                      min="13"
                      max="120"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="age" component="div" className="text-red-400 text-sm mt-1" />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Weight (kg) *
                    </label>
                    <Field
                      name="weight"
                      type="number"
                      min="20"
                      max="300"
                      step="0.1"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="weight" component="div" className="text-red-400 text-sm mt-1" />
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Height (cm) *
                    </label>
                    <Field
                      name="height"
                      type="number"
                      min="100"
                      max="250"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <ErrorMessage name="height" component="div" className="text-red-400 text-sm mt-1" />
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fitness Goal *
                    </label>
                    <Field
                      name="goal"
                      as="select"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {goals.map(goal => (
                        <option key={goal} value={goal} className="bg-gray-800">
                          {goal}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="goal" component="div" className="text-red-400 text-sm mt-1" />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500/20 text-gray-300 px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-500/30 transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-gray-300 text-sm">Age</p>
                  <p className="text-white font-semibold">{user.age} years</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <Weight className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-gray-300 text-sm">Weight</p>
                  <p className="text-white font-semibold">{user.weight} kg</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <Ruler className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-gray-300 text-sm">Height</p>
                  <p className="text-white font-semibold">{user.height} cm</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-gray-300 text-sm">Goal</p>
                  <p className="text-white font-semibold text-xs">{user.goal}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Health Metrics */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6">Health Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">BMI</h3>
            <p className="text-3xl font-bold text-white mb-1">{bmi}</p>
            <p className={`text-sm font-medium ${bmiInfo.color}`}>{bmiInfo.category}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Ideal Weight Range</h3>
            <p className="text-lg font-bold text-white mb-1">
              {idealWeight.min} - {idealWeight.max} kg
            </p>
            <p className="text-sm text-gray-300">Based on BMI 18.5-24.9</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Daily Calories (BMR)</h3>
            <p className="text-lg font-bold text-white mb-1">{bmr} kcal</p>
            <p className="text-sm text-gray-300">Estimated base metabolic rate</p>
          </div>
        </div>
      </div>

      {/* Fitness Recommendations */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6">Fitness Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="font-medium text-white mb-3">Recommended Workout Frequency</h3>
            <p className="text-gray-300 text-sm">
              {user.goal === 'Build Muscle' ? '4-5 times per week with focus on progressive overload' :
               user.goal === 'Lose Weight' ? '5-6 times per week combining cardio and strength training' :
               user.goal === 'Increase Strength' ? '3-4 times per week with heavy compound movements' :
               user.goal === 'Improve Endurance' ? '4-6 times per week with cardio emphasis' :
               '3-4 times per week with balanced training'}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="font-medium text-white mb-3">Focus Areas</h3>
            <p className="text-gray-300 text-sm">
              {user.goal === 'Build Muscle' ? 'Progressive overload, compound movements, adequate rest' :
               user.goal === 'Lose Weight' ? 'Caloric deficit, high-intensity training, consistency' :
               user.goal === 'Increase Strength' ? 'Heavy lifting, low reps, proper form' :
               user.goal === 'Improve Endurance' ? 'Cardio training, circuit workouts, stamina building' :
               'Balanced approach to strength and cardiovascular fitness'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;