import React, { useState, useEffect } from 'react';
import { Wallet, ChevronDown, Calendar, LogOut, User } from 'lucide-react';
import ExpenseTracker from './ExpenseTracker';
import BudgetPlanner from './BudgetPlanner';
import CurrencyConverter from './CurrencyConverter';
import SavingGoals from "./SavingGoals";
import { useAuth } from "./AuthProvider";
import Profile from "./Profile";
import CalendarItem from "./CalendarItem"; 
import Todo from "./Todo";
import TaskManager from './TaskManager';
import ChatWidget from "./ChatWidget";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import RecentNote from "./RecentNote";
import UpcomingTasks from "./UpcomingTasks";
import MotivationalQuote from './MotivationalQuote';

function DashboardOne() {
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [selectedSubfeature, setSelectedSubfeature] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuth();
  const nav = useNavigate();

  const features = [
    {
      id: 1,
      title: 'Finance & Budget Hub',
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-600',
      subfeatures: [
        { id: 1, name: 'Budget Planner', icon: '📊' },
        { id: 2, name: 'Expense Tracker', icon: '💳' },
        { id: 3, name: 'Savings Goals', icon: '🎯' },
        { id: 4, name: 'Currency Converter', icon: '💱' }
      ]
    },

    {
      id: 2,
      title: 'Life Planning Dashboard',
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600',
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-600',
      subfeatures: [
        { id: 1, name: 'Calendar', icon: '📅' },
        { id: 2, name: 'Task Manager', icon: '✓' },
        // { id: 3, name: 'Travel Planner', icon: '✈️' },
        // { id: 4, name: 'Documents', icon: '📋' },
      ]
    }
  ];

  const COLORS = ['#4A85FF', '#3EC6A8', '#FFD166', '#EF476F', '#06D6A0'];

  const toggleFeature = (featureId) => {
    setExpandedFeature(expandedFeature === featureId ? null : featureId);
    setSelectedSubfeature(null);
  };

  const handleSubfeatureClick = (subfeatureId, featureId) => {
    setExpandedFeature(featureId); // ensure sidebar expanded for that feature
    setSelectedSubfeature({ featureId, subfeatureId });
  };

  // Helper open functions so any card can open the correct subfeature reliably
  const openBudgetPlanner = () => handleSubfeatureClick(1, 1);
  const openExpenseTracker = () => handleSubfeatureClick(2, 1);
  const openSavingsGoals = () => handleSubfeatureClick(3, 1);
  const openCurrencyConverter = () => handleSubfeatureClick(4, 1);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      nav("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const getSubfeaturesForDisplay = () => {
    if (!expandedFeature) return [];

    const feature = features.find(f => f.id === expandedFeature);
    return feature ? feature.subfeatures.map(sub => ({
      ...sub,
      featureName: feature.title,
      featureId: feature.id,
      featureIcon: sub.icon
    })) : [];
  };

  const displayedSubfeatures = getSubfeaturesForDisplay();

  const getToken = async () => {
    const user = getAuth().currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };
  const fetchBudget = async () => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch("http://127.0.0.1:5000/budget/get_budget_summary", {
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();
    setSummaryData(data);
  };
  const fetchGoals = async () => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch("http://127.0.0.1:5000/api/goals/get_goals", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setGoals(data.goals || data || []);
  };


  useEffect(() => {
    fetchBudget();
    fetchGoals();
  }, []);

  // ---------- Small helper components (inline for single-file) ----------
  const TopSummaryRow = ({ summary }) => (
    <div className="bg-transparent">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={openBudgetPlanner}
          role="button"
          className="bg-white rounded-2xl p-4 shadow-md cursor-pointer"
        >
          <div className="text-sm text-[#6E7A8A]">Total Budget</div>
          <div className="text-2xl font-semibold text-[#1A2D5F]">${summary?.total_budget ?? 0}</div>
        </div>

        <div
          onClick={openExpenseTracker}
          role="button"
          className="bg-white rounded-2xl p-4 shadow-md cursor-pointer"
        >
          <div className="text-sm text-[#6E7A8A]">Spent</div>
          <div className="text-2xl font-semibold text-[#EF476F]">${summary?.total_spent ?? 0}</div>
        </div>

        <div
          onClick={openBudgetPlanner}
          role="button"
          className="bg-white rounded-2xl p-4 shadow-md cursor-pointer"
        >
          <div className="text-sm text-[#6E7A8A]">Remaining</div>
          <div className="text-2xl font-semibold text-[#06D6A0]">${summary?.remaining ?? 0}</div>
        </div>

        <div
          onClick={openSavingsGoals}
          role="button"
          className="bg-white rounded-2xl p-4 shadow-md cursor-pointer"
        >
          <div className="text-sm text-[#6E7A8A]">Active Goals</div>
          <div className="text-2xl font-semibold text-[#4A85FF]">{goals.filter(g => g.status !== "Completed").length}</div>
        </div>
      </div>
    </div>
  );
  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <nav className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-[#4A85FF]" />
              <span className="ml-2 text-2xl font-bold text-[#1A2D5F]">NexWise</span>
            </div>

            <div className=" items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center spave-x-2 bg-gray-100 px-3 py-1 rounded-full cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
                    <User className="w-5 h-5 text-gray-700" />
                    <span className="text-sm">{user?.email}</span>
                </div>
                {profileOpen && (
                  <Profile user={user} onClose={() => setProfileOpen(false)} />
                )}

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border-2 border-[#4A85FF] text-[#4A85FF] font-medium hover:bg-[#4A85FF] hover:text-white transition-colors flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <div className="flex pt-16 min-h-screen">
        <aside className="hidden md:flex md:w-64 lg:w-72 bg-white shadow-md flex-col">
          <div className="flex-1 px-4 py-6 space-y-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isExpanded = expandedFeature === feature.id;

              return (
                <div key={feature.id}>
                  <button
                    onClick={() => toggleFeature(feature.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      isExpanded
                        ? `bg-gradient-to-r ${feature.color} text-white shadow-md`
                        : 'text-[#1A2D5F] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium text-sm">{feature.title}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-2 ml-4 space-y-1">
                      {feature.subfeatures.map((subfeature) => (
                        <button
                          key={subfeature.id}
                          onClick={() => handleSubfeatureClick(subfeature.id, feature.id)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer ${
                            selectedSubfeature?.featureId === feature.id &&
                            selectedSubfeature?.subfeatureId === subfeature.id
                              ? `bg-gradient-to-r ${feature.color} text-white shadow-md`
                              : `text-[#6E7A8A] hover:bg-gray-50 ${feature.textColor}`
                          }`}
                        >
                          <span className="mr-2">{subfeature.icon}</span>
                          {subfeature.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {selectedSubfeature ? (
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setSelectedSubfeature(null)}
                    className="text-[#4A85FF] hover:text-[#3a75ef] font-medium mb-4 flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span>Back to Dashboard</span>
                  </button>

                  {(() => {
                    const feature = features.find(f => f.id === selectedSubfeature.featureId);
                    const subfeature = feature.subfeatures.find(s => s.id === selectedSubfeature.subfeatureId);

                    if (subfeature.name === 'Expense Tracker') return <ExpenseTracker />;
                    if (subfeature.name === 'Budget Planner') return <BudgetPlanner />;
                    if (subfeature.name === 'Currency Converter') return <CurrencyConverter />;
                    if (subfeature.name === 'Savings Goals') return <SavingGoals />;
                    if (subfeature.name === 'Calendar') return <CalendarItem user={user}/>;
                    if (subfeature.name === 'Task Manager') return <TaskManager />;


                    return (
                      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <div className="space-y-6">
                          <h1 className="text-4xl md:text-5xl font-bold text-[#1A2D5F] mb-2">
                            {subfeature.name}
                          </h1>
                          <p className="text-lg text-[#6E7A8A]">{feature.title}</p>
                          <p className="text-[#6E7A8A] leading-relaxed">
                            Content for {subfeature.name} will go here.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#1A2D5F] mb-2">
                    Dashboard
                  </h1>
                  <p className="text-lg text-[#6E7A8A] mb-4">
                    Select a subfeature from the sidebar or click on any card below to get started
                  </p>
                </div>

                {/* Top summary row centered (matches sketch top small boxes) */}
                <div className="mb-4">
                  <TopSummaryRow summary={summaryData} />
                </div>
                {/* Main grid: center overview and right stacked boxes; bottom-left large summary */}
                <div className="max-w-5xl mx-auto mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Motivation – wider */}
                    <div className="md:col-span-2  space-y-6">
                      <MotivationalQuote />
                      <UpcomingTasks onOpen={() => handleSubfeatureClick(2, 2)} />
                    </div>

                    {/* Note – compact */}
                    <div className="md:col-span-1">
                      <RecentNote />
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    <div className="h-24 md:h-0"></div>
      <ChatWidget />
    </div>
  );
}
export default DashboardOne;