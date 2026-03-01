import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"

function Dashboard() {
  const navigate = useNavigate()

  const [subject, setSubject] = useState("")
  const [level, setLevel] = useState("Beginner")
  const [days, setDays] = useState("")
  const [hours, setHours] = useState("")

  const [plans, setPlans] = useState([])
  const [expandedPlan, setExpandedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await API.get("/plans/")
      setPlans(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const generatePlan = async (e) => {
    e.preventDefault()
    if (!subject || days < 1 || hours < 1) {
      setError("Please enter valid values")
      return
    }
    setLoading(true)
    setError("")

    try {
      await API.post("/plans/generate", {
        subject,
        level,
        days,
        hours,
      })

      await fetchPlans()
      setSubject("")
      setLevel("Beginner")
      setDays("")
      setHours("")
    } catch {
      setError("Failed to generate plan")
    } finally {
      setLoading(false)
    }
  }

  const toggleTopic = async (planId, dayIndex, topicIndex) => {
    try {
      const res = await API.post(`/plans/${planId}/toggle`, {
        day_index: dayIndex,
        topic_index: topicIndex,
      })

      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                plan_data: res.data.plan_data,
                completion_percentage: res.data.completion_percentage,
              }
            : plan
        )
      )
    } catch (err) {
      console.log(err)
    }
  }

  const deletePlan = async (planId) => {
    if (!window.confirm("Delete this plan?")) return

    try {
      await API.delete(`/plans/${planId}`)
      setPlans(plans.filter((p) => p.id !== planId))
    } catch (err) {
      console.log(err)
    }
  }

  // 📊 Stats Calculation
  const totalPlans = plans.length
  const totalHours = plans.reduce(
    (sum, p) =>
      sum +
      p.plan_data.reduce(
        (daySum, day) =>
          daySum +
          day.topics.reduce((tSum, t) => tSum + t.hours, 0),
        0
      ),
    0
  )

  const avgCompletion =
    totalPlans > 0
      ? plans.reduce((sum, p) => sum + p.completion_percentage, 0) /
        totalPlans
      : 0

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <div className="flex justify-between items-center px-10 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-400">
          AI Smart Study Planner
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* 📊 Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-sm">Total Plans</h3>
            <p className="text-3xl font-bold text-blue-400">
              {totalPlans}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-sm">Total Study Hours</h3>
            <p className="text-3xl font-bold text-blue-400">
              {totalHours}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-sm">Average Completion</h3>
            <p className="text-3xl font-bold text-blue-400">
              {avgCompletion.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Generator */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 mb-10">
          <h2 className="text-xl font-semibold mb-6 text-blue-400">
            Generate Study Plan
          </h2>

          <form
            onSubmit={generatePlan}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <input
              type="text"
              placeholder="Subject"
              className="p-3 rounded bg-slate-800"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <select
              className="p-3 rounded bg-slate-800"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <input
              type="number"
              placeholder="Days"
              min="1"
              max="365"
              className="p-3 rounded bg-slate-800"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Hours per day"
              min="1"
              max="24"
              step="0.5"
              className="p-3 rounded bg-slate-800"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />

            <button
              type="submit"
              className="sm:col-span-2 lg:col-span-4 bg-blue-500 hover:bg-blue-600 p-3 rounded font-semibold"
            >
              {loading ? "Generating..." : "Generate Plan"}
            </button>
          </form>

          {error && (
            <div className="mt-4 text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Plans */}
        {plans.length === 0 ? (
          <div className="bg-slate-900 p-10 rounded-2xl text-center border border-slate-800">
            <p className="text-slate-400">
              No study plans yet. Generate one to begin 🚀
            </p>
          </div>
        ) : (
          plans.map((plan) => {
            const isExpanded = expandedPlan === plan.id

            return (
              <div
                key={plan.id}
                className="mb-8 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
              >
                <div
                  onClick={() =>
                    setExpandedPlan(isExpanded ? null : plan.id)
                  }
                  className="flex justify-between items-center p-6 cursor-pointer hover:bg-slate-800 transition"
                >
                  <div>
                    <h2 className="text-lg font-bold text-blue-400">
                      {plan.subject} ({plan.level})
                    </h2>
                    <p className="text-sm text-slate-400">
                      {plan.days} days
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">
                        {plan.completion_percentage.toFixed(1)}%
                      </p>
                      <div className="w-40 bg-slate-800 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${plan.completion_percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePlan(plan.id)
                      }}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 border-t border-slate-800">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {plan.plan_data.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="bg-slate-800 p-4 rounded-xl"
                        >
                          <h3 className="font-semibold mb-3 text-blue-300">
                            Day {day.day}
                          </h3>

                          {day.topics.map((topic, topicIndex) => (
                            <div
                              key={topicIndex}
                              className="flex items-start gap-2 mb-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={topic.completed}
                                onChange={() =>
                                  toggleTopic(
                                    plan.id,
                                    dayIndex,
                                    topicIndex
                                  )
                                }
                              />
                              <span
                                className={
                                  topic.completed
                                    ? "line-through text-slate-500"
                                    : ""
                                }
                              >
                                {topic.name} ({topic.hours}h)
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Dashboard
