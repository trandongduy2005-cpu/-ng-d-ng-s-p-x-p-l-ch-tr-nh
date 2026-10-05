import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ScheduleView } from './components/Schedule/ScheduleView';
import { TasksExpensesView } from './components/TasksExpenses/TasksExpensesView';
import { TravelView } from './components/Travel/TravelView';
import { JobsView } from './components/Jobs/JobsView';
import { AIAssistantModal } from './components/AI/AIAssistantModal';
import { BookingModal } from './components/Modals/BookingModal';
import { ShareModal } from './components/Modals/ShareModal';
import { AuthModal } from './components/Modals/AuthModal';
import { Sparkles, Heart, Globe, Shield, Calendar, CheckSquare, Compass, Briefcase } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, language } = useApp();
  const isVi = language === 'vi';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/60 via-pink-50/40 to-fuchsia-50/50 text-slate-800 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Sticky Top Header */}
      <Navbar />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'tasks_expenses' && <TasksExpensesView />}
        {activeTab === 'travel' && <TravelView />}
        {activeTab === 'jobs' && <JobsView />}
      </main>

      {/* Global Modals */}
      <AIAssistantModal />
      <BookingModal />
      <ShareModal />
      <AuthModal />

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white/70 backdrop-blur-xs py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent text-sm">
              SmartPlanner
            </span>
            <span className="text-slate-300">•</span>
            <span>
              {isVi
                ? 'Nền tảng sắp xếp lịch trình, cân bằng cuộc sống & du lịch miễn phí'
                : 'Free AI schedule planner, life balance & travel companion'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-purple-700 font-semibold">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              <span>{isVi ? 'Dành cho Học sinh, Sinh viên & Nghệ sĩ' : 'For Students, Artists & Everyone'}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>© 2026 SmartPlanner</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
