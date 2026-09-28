import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskItem, TaskPriority, TaskCategory, ExpenseItem, ExpenseType, ExpenseCategory } from '../../types';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Sparkles,
  PieChart,
  CheckCircle2,
  Circle,
  Clock,
  HeartPulse,
  BookOpen,
  Coffee,
  Moon,
  ShieldAlert,
} from 'lucide-react';

export const TasksExpensesView: React.FC = () => {
  const {
    tasks,
    expenses,
    monthlyBudget,
    language,
    isReadOnlyShareMode,
    addTask,
    deleteTask,
    toggleTask,
    addExpense,
    deleteExpense,
    setMonthlyBudget,
    calculateLifeBalance,
    setIsAIAssistantOpen,
  } = useApp();

  const isVi = language === 'vi';
  const lifeBalance = calculateLifeBalance();

  // Active sub-tab: All, Tasks only, Expenses only, Balance only
  const [activeSection, setActiveSection] = useState<'both' | 'tasks' | 'expenses'>('both');

  // Task form state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    category: 'study' as TaskCategory,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  });

  // Expense form state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    type: 'expense' as ExpenseType,
    category: 'food' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Budget edit state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  // Task filter
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Expense calculations
  const totalIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = expenses
    .filter((e) => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;
  const budgetSpentPercent = Math.min(100, Math.round((totalExpense / monthlyBudget) * 100));

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleToggleTask = (id: string, currentlyDone: boolean) => {
    toggleTask(id);
    if (!currentlyDone) {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#8B5CF6', '#EC4899', '#34D399'],
      });
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    addTask({
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || undefined,
      priority: taskForm.priority,
      category: taskForm.category,
      dueDate: taskForm.dueDate,
      completed: false,
    });

    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      category: 'study',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    });
    setIsTaskModalOpen(false);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseForm.amount);
    if (isNaN(amt) || amt <= 0 || !expenseForm.title.trim()) return;

    addExpense({
      title: expenseForm.title.trim(),
      amount: amt,
      type: expenseForm.type,
      category: expenseForm.category,
      date: expenseForm.date,
      note: expenseForm.note.trim() || undefined,
    });

    setExpenseForm({
      title: '',
      amount: '',
      type: 'expense',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
    setIsExpenseModalOpen(false);
  };

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
    }
    setIsEditingBudget(false);
  };

  const priorityColors: Record<TaskPriority, { bg: string; text: string; label: string }> = {
    high: { bg: 'bg-rose-100', text: 'text-rose-700', label: isVi ? 'Ưu tiên cao' : 'High Priority' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: isVi ? 'Trung bình' : 'Medium' },
    low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: isVi ? 'Thấp' : 'Low' },
  };

  const expenseCategoryLabels: Record<ExpenseCategory, string> = {
    food: isVi ? '🍽️ Ăn uống' : '🍽️ Food & Dining',
    study: isVi ? '📚 Học tập & Sách' : '📚 Study & Books',
    housing: isVi ? '🏠 Tiền phòng & Điện nước' : '🏠 Rent & Utilities',
    transport: isVi ? '🛵 Đi lại & Xăng xe' : '🛵 Transport',
    shopping: isVi ? '🛍️ Mua sắm' : '🛍️ Shopping',
    health: isVi ? '💪 Thể thao & Y tế' : '💪 Health & Fitness',
    entertainment: isVi ? '☕ Cà phê & Giải trí' : '☕ Entertainment',
    salary: isVi ? '💰 Lương / Học bổng' : '💰 Salary / Scholarship',
    other: isVi ? '📦 Chi tiêu khác' : '📦 Other',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Life Balance Wheel & Daily Health Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-800 via-fuchsia-700 to-pink-600 p-6 sm:p-7 text-white shadow-xl shadow-purple-500/15">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-pink-100">
              <Scale className="w-3.5 h-3.5 text-pink-200" />
              <span>{isVi ? 'Thước Đo Cân Bằng Cuộc Sống Trong Ngày' : 'Daily Life Balance Wheel'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {isVi ? 'Phân Bổ Hoạt Động & Năng Lượng Hôm Nay' : 'Daily Activity & Energy Distribution'}
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-xl leading-relaxed">
              {lifeBalance.aiAdvice}
            </p>
          </div>

          {/* Balance Score Dial */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-white/20 fill-none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * lifeBalance.balanceScore) / 100}
                  className="text-pink-300 fill-none transition-all duration-1000"
                />
              </svg>
              <span className="absolute font-extrabold text-lg text-white">
                {lifeBalance.balanceScore}
              </span>
            </div>
            <div className="text-xs">
              <p className="font-bold text-white uppercase tracking-wider text-[10px]">
                {isVi ? 'Chỉ số cân bằng' : 'Balance Score'}
              </p>
              <p className="text-pink-200 font-semibold text-xs mt-0.5">
                {lifeBalance.balanceScore >= 80
                  ? isVi
                    ? 'Rất Cân Bằng 🌟'
                    : 'Optimal 🌟'
                  : lifeBalance.balanceScore >= 60
                  ? isVi
                    ? 'Khá Tốt 👍'
                    : 'Good 👍'
                  : isVi
                  ? 'Cần Điều Chỉnh ⚠️'
                  : 'Needs Attention ⚠️'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Daily Life */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-white/20 text-xs">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <div className="flex items-center gap-2 text-purple-200 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-semibold">{isVi ? 'Học & Làm' : 'Study/Work'}</span>
            </div>
            <p className="text-lg font-bold text-white">{lifeBalance.studyWorkHours}h</p>
            <p className="text-[10px] text-purple-200">{isVi ? 'Mục tiêu: 6-8h' : 'Target: 6-8h'}</p>
          </div>

          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <div className="flex items-center gap-2 text-pink-200 mb-1">
              <Moon className="w-3.5 h-3.5" />
              <span className="font-semibold">{isVi ? 'Nghỉ & Ngủ' : 'Sleep/Rest'}</span>
            </div>
            <p className="text-lg font-bold text-white">{lifeBalance.restSleepHours}h</p>
            <p className="text-[10px] text-pink-200">{isVi ? 'Mục tiêu: 7-8h' : 'Target: 7-8h'}</p>
          </div>

          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <div className="flex items-center gap-2 text-rose-200 mb-1">
              <HeartPulse className="w-3.5 h-3.5" />
              <span className="font-semibold">{isVi ? 'Gym & Nhảy' : 'Sport/Gym'}</span>
            </div>
            <p className="text-lg font-bold text-white">{lifeBalance.healthSportHours}h</p>
            <p className="text-[10px] text-rose-200">{isVi ? 'Mục tiêu: 1-1.5h' : 'Target: 1-1.5h'}</p>
          </div>

          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <div className="flex items-center gap-2 text-fuchsia-200 mb-1">
              <Coffee className="w-3.5 h-3.5" />
              <span className="font-semibold">{isVi ? 'Cá nhân & Bạn bè' : 'Personal'}</span>
            </div>
            <p className="text-lg font-bold text-white">{lifeBalance.personalSocialHours}h</p>
            <p className="text-[10px] text-fuchsia-200">{isVi ? 'Mục tiêu: 2-3h' : 'Target: 2-3h'}</p>
          </div>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-purple-100 pb-3">
        <div className="flex items-center gap-2 bg-purple-50/80 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSection('both')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSection === 'both' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            {isVi ? 'Xem Cả Hai Mục' : 'View Both'}
          </button>
          <button
            onClick={() => setActiveSection('tasks')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSection === 'tasks' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            {isVi ? 'Chỉ Nhiệm Vụ' : 'Tasks Only'}
          </button>
          <button
            onClick={() => setActiveSection('expenses')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSection === 'expenses' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            {isVi ? 'Chỉ Chi Tiêu' : 'Expenses Only'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnlyShareMode && (
            <>
              {(activeSection === 'both' || activeSection === 'tasks') && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition cursor-pointer border border-purple-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isVi ? '+ Thêm nhiệm vụ' : '+ Add Task'}</span>
                </button>
              )}

              {(activeSection === 'both' || activeSection === 'expenses') && (
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-sm hover:opacity-95 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isVi ? '+ Ghi nhận thu/chi' : '+ Record Expense'}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Left Tasks, Right Expenses */}
      <div
        className={`grid gap-6 ${
          activeSection === 'both'
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1'
        }`}
      >
        {/* === SECTION 1: TASKS & TO-DO === */}
        {(activeSection === 'both' || activeSection === 'tasks') && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">
                      {isVi ? 'Danh Sách Nhiệm Vụ & Deadline' : 'Tasks & Deadlines'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isVi
                        ? `Đã hoàn thành ${completedTasksCount}/${tasks.length} nhiệm vụ (${taskProgress}%)`
                        : `${completedTasksCount}/${tasks.length} completed (${taskProgress}%)`}
                    </p>
                  </div>
                </div>

                {/* Task Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      taskFilter === 'all' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {isVi ? 'Tất cả' : 'All'}
                  </button>
                  <button
                    onClick={() => setTaskFilter('pending')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      taskFilter === 'pending' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {isVi ? 'Cần làm' : 'Todo'}
                  </button>
                  <button
                    onClick={() => setTaskFilter('completed')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      taskFilter === 'completed' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {isVi ? 'Đã xong' : 'Done'}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-purple-100/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>

              {/* Task list items */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    {isVi ? 'Không có nhiệm vụ nào trong mục này' : 'No tasks in this filter'}
                  </div>
                ) : (
                  filteredTasks.map((t) => {
                    const priority = priorityColors[t.priority];
                    return (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                          t.completed
                            ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                            : 'bg-white border-purple-100 hover:border-purple-300 hover:shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => handleToggleTask(t.id, t.completed)}
                            disabled={isReadOnlyShareMode}
                            className="mt-0.5 cursor-pointer text-purple-600 hover:text-purple-800 transition flex-shrink-0"
                          >
                            {t.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 hover:text-purple-500" />
                            )}
                          </button>

                          <div className="space-y-1 flex-1">
                            <p
                              className={`text-xs sm:text-sm font-bold text-slate-800 leading-snug ${
                                t.completed ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {t.title}
                            </p>
                            {t.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {t.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold ${priority.bg} ${priority.text}`}
                              >
                                {priority.label}
                              </span>

                              <span className="flex items-center gap-1 text-slate-500 font-medium">
                                <Calendar className="w-3 h-3 text-purple-500" />
                                <span>
                                  {isVi ? 'Hạn chót: ' : 'Due: '}
                                  {t.dueDate}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isReadOnlyShareMode && (
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* === SECTION 2: EXPENSES & BUDGET === */}
        {(activeSection === 'both' || activeSection === 'expenses') && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-pink-100 text-pink-700">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">
                      {isVi ? 'Quản Lý Thu Chi & Ngân Sách' : 'Expenses & Budget Tracker'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isVi ? 'Kiểm soát tài chính sinh viên & cá nhân' : 'Manage your cashflow & spending'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                  {isVi ? 'Tháng này' : 'This Month'}
                </span>
              </div>

              {/* 3 Summary Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold mb-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Tổng Thu' : 'Income'}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-800 truncate">
                    +{formatVND(totalIncome)}
                  </p>
                </div>

                <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-100">
                  <div className="flex items-center gap-1 text-rose-700 font-semibold mb-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Tổng Chi' : 'Expenses'}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-rose-800 truncate">
                    -{formatVND(totalExpense)}
                  </p>
                </div>

                <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-100">
                  <div className="flex items-center gap-1 text-purple-700 font-semibold mb-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Số Dư' : 'Net'}</span>
                  </div>
                  <p className={`text-xs sm:text-sm font-extrabold truncate ${balance >= 0 ? 'text-purple-900' : 'text-rose-700'}`}>
                    {formatVND(balance)}
                  </p>
                </div>
              </div>

              {/* Monthly Budget Progress Bar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/80 to-pink-50/80 border border-purple-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    {isVi ? 'Hạn mức chi tiêu tháng:' : 'Monthly Budget:'}
                  </span>
                  <div className="flex items-center gap-2">
                    {isEditingBudget ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={budgetInput}
                          onChange={(e) => setBudgetInput(e.target.value)}
                          className="w-24 px-2 py-0.5 rounded border border-purple-300 text-xs font-bold"
                        />
                        <button
                          onClick={handleSaveBudget}
                          className="px-2 py-0.5 bg-purple-600 text-white rounded font-bold cursor-pointer"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-purple-800">
                          {formatVND(monthlyBudget)}
                        </span>
                        {!isReadOnlyShareMode && (
                          <button
                            onClick={() => setIsEditingBudget(true)}
                            className="text-purple-600 hover:text-purple-900 font-bold underline cursor-pointer text-[10px]"
                          >
                            {isVi ? 'Sửa' : 'Edit'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      budgetSpentPercent > 90
                        ? 'bg-rose-500'
                        : budgetSpentPercent > 70
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-purple-600 to-pink-500'
                    }`}
                    style={{ width: `${budgetSpentPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {isVi
                      ? `Đã chi: ${formatVND(totalExpense)} (${budgetSpentPercent}%)`
                      : `Spent: ${formatVND(totalExpense)} (${budgetSpentPercent}%)`}
                  </span>
                  <span>
                    {isVi
                      ? `Còn lại: ${formatVND(Math.max(0, monthlyBudget - totalExpense))}`
                      : `Left: ${formatVND(Math.max(0, monthlyBudget - totalExpense))}`}
                  </span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
                <p className="font-bold text-slate-700 text-xs pt-1">
                  {isVi ? 'Lịch sử giao dịch gần đây' : 'Recent Transactions'}
                </p>
                {expenses.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">
                    {isVi ? 'Chưa có khoản thu chi nào' : 'No transactions recorded'}
                  </p>
                ) : (
                  expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 flex items-center justify-between gap-3 transition"
                    >
                      <div className="space-y-0.5 flex-1">
                        <p className="font-bold text-slate-800 text-xs">{exp.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <span>{expenseCategoryLabels[exp.category]}</span>
                          <span>•</span>
                          <span>{exp.date}</span>
                          {exp.note && (
                            <>
                              <span>•</span>
                              <span className="italic truncate max-w-[120px]">{exp.note}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-xs ${
                            exp.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {exp.type === 'income' ? '+' : '-'}
                          {formatVND(exp.amount)}
                        </span>

                        {!isReadOnlyShareMode && (
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="text-slate-300 hover:text-rose-500 p-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Task */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <h3 className="font-extrabold text-slate-800 text-base">
                {isVi ? 'Thêm Nhiệm Vụ Mới' : 'Add New Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Tên nhiệm vụ / Việc cần làm *' : 'Task title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isVi ? 'VD: Nộp bài tập nhóm, Làm đề thi thử, Gửi demo nhạc...' : 'e.g. Finish report, Submit slides...'}
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Mức ưu tiên' : 'Priority'}
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-semibold"
                  >
                    <option value="high">{isVi ? '🔥 Cao' : '🔥 High'}</option>
                    <option value="medium">{isVi ? '⚡ Trung bình' : '⚡ Medium'}</option>
                    <option value="low">{isVi ? '🌱 Thấp' : '🌱 Low'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Hạn hoàn thành' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Chi tiết / Ghi chú' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isVi ? 'Ghi chú thêm về link nộp bài, tiêu chí cần hoàn thành...' : 'Extra notes...'}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold shadow-md hover:bg-purple-700 cursor-pointer"
                >
                  {isVi ? 'Tạo Nhiệm Vụ' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <h3 className="font-extrabold text-slate-800 text-base">
                {isVi ? 'Ghi Nhận Thu / Chi Mới' : 'Add New Transaction'}
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 mt-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 p-1 bg-purple-50 rounded-xl">
                <button
                  type="button"
                  onClick={() => setExpenseForm({ ...expenseForm, type: 'expense' })}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    expenseForm.type === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  {isVi ? 'Khoản Chi Tiêu (-)' : 'Expense (-)'}
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseForm({ ...expenseForm, type: 'income' })}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    expenseForm.type === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  {isVi ? 'Khoản Thu Nhập (+)' : 'Income (+)'}
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Tên khoản tiền *' : 'Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isVi ? 'VD: Cơm trưa, Mua giáo trình, Tiền trọ, Lương part-time...' : 'e.g. Lunch, Textbooks, Room rent...'}
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Số tiền (VNĐ) *' : 'Amount (VND) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="VD: 50000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-bold text-purple-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Danh mục' : 'Category'}
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
                    className="w-full px-2 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-semibold"
                  >
                    <option value="food">{isVi ? '🍽️ Ăn uống' : 'Food'}</option>
                    <option value="study">{isVi ? '📚 Học tập' : 'Study'}</option>
                    <option value="housing">{isVi ? '🏠 Tiền phòng' : 'Housing'}</option>
                    <option value="transport">{isVi ? '🛵 Đi lại' : 'Transport'}</option>
                    <option value="shopping">{isVi ? '🛍️ Mua sắm' : 'Shopping'}</option>
                    <option value="health">{isVi ? '💪 Thể thao / Gym' : 'Health'}</option>
                    <option value="entertainment">{isVi ? '☕ Cà phê / Giải trí' : 'Entertainment'}</option>
                    <option value="salary">{isVi ? '💰 Lương / Thu nhập' : 'Salary'}</option>
                    <option value="other">{isVi ? '📦 Khác' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Ngày giao dịch' : 'Date'}
                </label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Ghi chú thêm' : 'Note'}
                </label>
                <input
                  type="text"
                  placeholder={isVi ? 'VD: Mua cùng bạn bè, giảm giá 20%...' : 'Extra notes...'}
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-md hover:opacity-95 cursor-pointer"
                >
                  {isVi ? 'Lưu Giao Dịch' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
