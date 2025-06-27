import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000";

function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.user_id || !user?.token) return;

      try {
        const res = await axios.get(`${API}/dashboard/summary?user_id=${user.user_id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch summary", err);
      }
    };

    fetchSummary();
  }, [user]);

  if (!summary) return <p className="p-6">Loading summary...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Dashboard Summary</h2>
      <ul className="space-y-2">
        <li className="bg-gray-100 p-3 rounded">Total Workouts: {summary.total_workouts}</li>
        <li className="bg-gray-100 p-3 rounded">Total Exercises: {summary.total_exercises}</li>
        <li className="bg-gray-100 p-3 rounded">Total Volume: {summary.total_volume} kg</li>
      </ul>
    </div>
  );
}

export default Dashboard;