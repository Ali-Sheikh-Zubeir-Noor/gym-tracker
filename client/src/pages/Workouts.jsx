import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

function Workouts() {
  const token = localStorage.getItem("token");
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded.user_id);
      const res = await axios.get(`${API}/workouts?user_id=${decoded.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(res.data);
    };
    if (token) fetchData();
  }, [token]);

  const handleAddWorkout = async () => {
    const res = await axios.post(
      `${API}/workouts`,
      { title: newWorkout, user_id: userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setWorkouts([...workouts, res.data]);
    setNewWorkout("");
  };

  const handleDeleteWorkout = async (id) => {
    await axios.delete(`${API}/workouts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWorkouts(workouts.filter((w) => w.id !== id));
  };

  const handleAddExercise = async (workoutId, newExercise) => {
    const res = await axios.post(`${API}/exercises`, newExercise, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId ? { ...w, exercises: [...(w.exercises || []), res.data] } : w
      )
    );
  };

  const handleDeleteExercise = async (id, workoutId) => {
    await axios.delete(`${API}/exercises/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId
          ? { ...w, exercises: w.exercises.filter((e) => e.id !== id) }
          : w
      )
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Workouts</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Workout Title"
          value={newWorkout}
          onChange={(e) => setNewWorkout(e.target.value)}
          className="border p-2 w-full"
        />
        <button onClick={handleAddWorkout} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>
      {workouts.map((workout) => (
        <div key={workout.id} className="border rounded mb-6 p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">{workout.title}</h3>
            <button onClick={() => handleDeleteWorkout(workout.id)} className="text-red-500">
              Delete
            </button>
          </div>
          <ul className="mb-2">
            {workout.exercises?.map((ex) => (
              <li key={ex.id} className="flex justify-between py-1">
                {ex.name} - {ex.sets}x{ex.reps} @ {ex.weight}kg
                <button
                  onClick={() => handleDeleteExercise(ex.id, workout.id)}
                  className="text-red-400 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <AddExerciseForm
            workoutId={workout.id}
            onAdd={(data) =>
              handleAddExercise(workout.id, { ...data, workout_id: workout.id })
            }
          />
        </div>
      ))}
    </div>
  );
}

function AddExerciseForm({ workoutId, onAdd }) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ name, sets: +sets, reps: +reps, weight: +weight });
    setName(""); setSets(""); setReps(""); setWeight("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2 flex-wrap">
      <input
        placeholder="Exercise"
        className="border p-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        placeholder="Sets"
        type="number"
        className="border p-1 w-20"
        value={sets}
        onChange={(e) => setSets(e.target.value)}
        required
      />
      <input
        placeholder="Reps"
        type="number"
        className="border p-1 w-20"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        required
      />
      <input
        placeholder="Weight"
        type="number"
        className="border p-1 w-24"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        required
      />
      <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded">
        Add
      </button>
    </form>
  );
}

export default Workouts;
