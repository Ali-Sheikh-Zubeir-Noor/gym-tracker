import React from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X, Plus, Trash2 } from 'lucide-react';

const ExerciseForm = ({ initialValues = null, onSubmit, onCancel }) => {
  const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
  const muscleGroupOptions = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Obliques',
    'Lats', 'Traps', 'Rhomboids', 'Deltoids'
  ];

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Exercise name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    category: Yup.string()
      .required('Category is required')
      .oneOf(categories, 'Please select a valid category'),
    muscle_groups: Yup.array()
      .of(Yup.string())
      .min(1, 'At least one muscle group is required'),
    equipment: Yup.string()
      .max(50, 'Equipment must be less than 50 characters'),
    instructions: Yup.string()
      .max(500, 'Instructions must be less than 500 characters')
  });

  const defaultValues = {
    name: '',
    category: '',
    muscle_groups: [],
    equipment: '',
    instructions: ''
  };

  // Parse muscle groups if editing
  const getInitialValues = () => {
    if (initialValues) {
      let muscleGroups = [];
      try {
        muscleGroups = JSON.parse(initialValues.muscle_groups || '[]');
      } catch (e) {
        muscleGroups = [];
      }
      
      return {
        ...initialValues,
        muscle_groups: muscleGroups
      };
    }
    return defaultValues;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {initialValues ? 'Edit Exercise' : 'Add New Exercise'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values);
          setSubmitting(false);
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Exercise Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exercise Name *
              </label>
              <Field
                name="name"
                type="text"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter exercise name"
              />
              <ErrorMessage name="name" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <Field
                name="category"
                as="select"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-gray-800">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-800">
                    {category}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="category" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            {/* Muscle Groups */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Muscle Groups *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto bg-white/5 rounded-lg p-4 border border-white/20">
                {muscleGroupOptions.map(muscleGroup => (
                  <label key={muscleGroup} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.muscle_groups.includes(muscleGroup)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFieldValue('muscle_groups', [...values.muscle_groups, muscleGroup]);
                        } else {
                          setFieldValue('muscle_groups', values.muscle_groups.filter(mg => mg !== muscleGroup));
                        }
                      }}
                      className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">{muscleGroup}</span>
                  </label>
                ))}
              </div>
              <ErrorMessage name="muscle_groups" component="div" className="text-red-400 text-sm mt-1" />
              
              {/* Selected muscle groups display */}
              {values.muscle_groups.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400 mb-2">Selected:</p>
                  <div className="flex flex-wrap gap-2">
                    {values.muscle_groups.map(muscle => (
                      <span
                        key={muscle}
                        className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs flex items-center space-x-1"
                      >
                        <span>{muscle}</span>
                        <button
                          type="button"
                          onClick={() => setFieldValue('muscle_groups', values.muscle_groups.filter(mg => mg !== muscle))}
                          className="hover:text-purple-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Equipment
              </label>
              <Field
                name="equipment"
                type="text"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Barbell, Dumbbells, Bodyweight"
              />
              <ErrorMessage name="equipment" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instructions
              </label>
              <Field
                name="instructions"
                as="textarea"
                rows="4"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe how to perform this exercise..."
              />
              <ErrorMessage name="instructions" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting 
                  ? (initialValues ? 'Updating...' : 'Creating...') 
                  : (initialValues ? 'Update Exercise' : 'Create Exercise')
                }
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ExerciseForm;