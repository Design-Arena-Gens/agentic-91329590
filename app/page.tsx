'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import * as XLSX from 'xlsx'

interface Goal {
  id: string
  title: string
  completed: boolean
  date: string
}

interface MonthlyStats {
  month: string
  completed: number
  total: number
}

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily')

  useEffect(() => {
    const savedGoals = localStorage.getItem('goals')
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals))
  }, [goals])

  const addGoal = () => {
    if (newGoalTitle.trim()) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: newGoalTitle,
        completed: false,
        date: selectedDate
      }
      setGoals([...goals, newGoal])
      setNewGoalTitle('')
    }
  }

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  const getFilteredGoals = () => {
    const today = new Date(selectedDate)

    if (view === 'daily') {
      return goals.filter(goal => goal.date === selectedDate)
    } else if (view === 'monthly') {
      return goals.filter(goal => {
        const goalDate = new Date(goal.date)
        return goalDate.getMonth() === today.getMonth() &&
               goalDate.getFullYear() === today.getFullYear()
      })
    } else {
      return goals.filter(goal => {
        const goalDate = new Date(goal.date)
        return goalDate.getFullYear() === today.getFullYear()
      })
    }
  }

  const filteredGoals = getFilteredGoals()
  const completedCount = filteredGoals.filter(g => g.completed).length
  const totalCount = filteredGoals.length

  const pieData = [
    { name: 'Completed', value: completedCount },
    { name: 'Pending', value: totalCount - completedCount }
  ]

  const COLORS = ['#10b981', '#ef4444']

  const getMonthlyData = (): MonthlyStats[] => {
    const currentYear = new Date(selectedDate).getFullYear()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return monthNames.map((month, index) => {
      const monthGoals = goals.filter(goal => {
        const goalDate = new Date(goal.date)
        return goalDate.getMonth() === index && goalDate.getFullYear() === currentYear
      })

      return {
        month,
        completed: monthGoals.filter(g => g.completed).length,
        total: monthGoals.length
      }
    })
  }

  const getYearlyData = () => {
    const years = Array.from(new Set(goals.map(g => new Date(g.date).getFullYear()))).sort()

    return years.map(year => {
      const yearGoals = goals.filter(goal => new Date(goal.date).getFullYear() === year)
      return {
        year: year.toString(),
        completed: yearGoals.filter(g => g.completed).length,
        total: yearGoals.length
      }
    })
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(goals.map(goal => ({
      Date: goal.date,
      Goal: goal.title,
      Status: goal.completed ? 'Completed' : 'Pending'
    })))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Goals')
    XLSX.writeFile(wb, `goals-tracker-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Daily Goal Tracker</h1>

          {/* View Toggle */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setView('daily')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                view === 'daily' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                view === 'monthly' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setView('yearly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                view === 'yearly' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex justify-center mb-8">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Add Goal Form */}
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Enter a new goal..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
            <button
              onClick={addGoal}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Add Goal
            </button>
            <button
              onClick={exportToExcel}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Export Excel
            </button>
          </div>

          {/* Goals List */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {view === 'daily' && 'Today\'s Goals'}
              {view === 'monthly' && 'This Month\'s Goals'}
              {view === 'yearly' && 'This Year\'s Goals'}
            </h2>
            <div className="space-y-3">
              {filteredGoals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No goals yet. Add one to get started!</p>
              ) : (
                filteredGoals.map(goal => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleGoal(goal.id)}
                      className="w-6 h-6 cursor-pointer accent-purple-600"
                    />
                    <span className={`flex-1 ${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {goal.title}
                    </span>
                    <span className="text-sm text-gray-500">{goal.date}</span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 rounded-xl text-white">
              <h3 className="text-lg font-semibold mb-2">Total Goals</h3>
              <p className="text-4xl font-bold">{totalCount}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-xl text-white">
              <h3 className="text-lg font-semibold mb-2">Completed</h3>
              <p className="text-4xl font-bold">{completedCount}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl text-white">
              <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
              <p className="text-4xl font-bold">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Goal Status Distribution</h3>
              {totalCount > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-20">No data to display</p>
              )}
            </div>

            {/* Bar/Line Chart */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {view === 'yearly' ? 'Yearly Progress' : 'Monthly Progress'}
              </h3>
              {(view === 'yearly' ? getYearlyData().length > 0 : true) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={view === 'yearly' ? getYearlyData() : getMonthlyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={view === 'yearly' ? 'year' : 'month'} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                    <Bar dataKey="total" fill="#6366f1" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-20">No data to display</p>
              )}
            </div>
          </div>

          {/* Yearly Trend Line */}
          {view === 'yearly' && getYearlyData().length > 0 && (
            <div className="bg-gray-50 p-6 rounded-xl mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Completion Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getYearlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Completed" />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
