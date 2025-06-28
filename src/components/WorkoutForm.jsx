import React from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Plus, Trash2, X } from 'lucide-react';

const WorkoutForm = ({ exercises, onSubmit, onCancel, initialValues = null }) => {
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Workout name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    notes: Yup.string()
      .max(200, 'Notes must be less than 200 characters'),
    exercises: Yup.array()
      .of(
        Yup.object({
          exercise_id: Yup.number().required('Exercise is required'),
          sets: Yup.number()
            .required('Sets are required')
            .min(1, 'Must have at least 1 set')
            .max(20, 'Cannot exceed 20 sets'),
          reps: Yup.number()
            .required('Reps are required')
            .min(1, 'Must have at least 1 rep')
            .max(100, 'Cannot exceed 100 reps'),
          weight: Yup.number()
            .min(0, 'Weight cannot be negative')
            .max(1000, 'Weight cannot exceed 1000kg'),
          rest_time: Yup.number()
            .min(0, 'Rest time cannot be negative')
            .max(600, 'Rest time cannot exceed 10 minutes')
        })
      )
      .min(1, 'At least one exercise is required')
  });

  const defaultValues = {
    name: '',
    notes: '',
    exercises: [
      {
        exercise_id: '',
        sets: 3,
        reps: 10,
        weight: 0,
        rest_time: 60,
        notes: ''
      }
    ]
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {initialValues ? 'Edit Workout' : 'Create New Workout'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Formik
        initialValues={initialValues || defaultValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values);
          setSubmitting(false);
        }}
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Workout Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Workout Name *
              </label>
              <Field
                name="name"
                type="text"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter workout name"
              />
              <ErrorMessage name="name" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <Field
                name="notes"
                as="textarea"
                rows="3"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add any notes about this workout..."
              />
              <ErrorMessage name="notes" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            {/* Exercises */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Exercises *
              </label>
              
              <FieldArray name="exercises">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.exercises.map((exercise, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-white">Exercise {index + 1}</h4>
                          {values.exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Exercise Selection */}
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm text-gray-400 mb-1">Exercise *</label>
                            <Field
                              name={`exercises.${index}.exercise_id`}
                              as="select"
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">Select an exercise</option>
                              {exercises.map((ex) => (
                                <option key={ex.id} value={ex.id} className="bg-gray-800">
                                  {ex.name} ({ex.category})
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage 
                              name={`exercises.${index}.exercise_id`} 
                              component="div" 
                              className="text-red-400 text-sm mt-1" 
                            />
                          </div>

                          {/* Sets */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Sets *</label>
                            <Field
                              name={`exercises.${index}.sets`}
                              type="number"
                              min="1"
                              max="20"
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <ErrorMessage 
                              name={`exercises.${index}.sets`} 
                              component="div" 
                              className="text-red-400 text-sm mt-1" 
                            />
                          </div>

                          {/* Reps */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Reps *</label>
                            <Field
                              name={`exercises.${index}.reps`}
                              type="number"
                              min="1"
                              max="100"
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <ErrorMessage 
                              name={`exercises.${index}.reps`} 
                              component="div" 
                              className="text-red-400 text-sm mt-1" 
                            />
                          </div>

                          {/* Weight */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Weight (kg)</label>
                            <Field
                              name={`exercises.${index}.weight`}
                              type="number"
                              min="0"
                              step="0.5"
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <ErrorMessage 
                              name={`exercises.${index}.weight`} 
                              component="div" 
                              className="text-red-400 text-sm mt-1" 
                            />
                          </div>

                          {/* Rest Time */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Rest (seconds)</label>
                            <Field
                              name={`exercises.${index}.rest_time`}
                              type="number"
                              min="0"
                              max="600"
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <ErrorMessage 
                              name={`exercises.${index}.rest_time`} 
                              component="div" 
                              className="text-red-400 text-sm mt-1" 
                            />
                          </div>

                          {/* Exercise Notes */}
                          <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Notes</label>
                            <Field
                              name={`exercises.${index}.notes`}
                              type="text"
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Exercise-specific notes..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => push({
                        exercise_id: '',
                        sets: 3,
                        reps: 10,
                        weight: 0,
                        rest_time: 60,
                        notes: ''
                      })}
                      className="w-full bg-white/5 border border-white/20 border-dashed rounded-lg p-4 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Exercise</span>
                    </button>
                  </div>
                )}
              </FieldArray>
              <ErrorMessage name="exercises" component="div" className="text-red-400 text-sm mt-1" />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Workout'}
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

export default WorkoutForm;