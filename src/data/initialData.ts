import { ScheduleEvent, TaskItem, ExpenseItem, UserProfile } from '../types';

/**
 * Clean & Fresh Initial State for SmartPlanna
 * Brand new user session - no pre-filled personal data.
 * Ready for the user to start from scratch and log in with their actual personal info.
 */
export const INITIAL_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  role: 'student',
  loginMethod: 'guest',
  isLoggedIn: false,
};

// Fresh empty schedules, tasks and expenses for new users
export const INITIAL_EVENTS: ScheduleEvent[] = [];
export const INITIAL_TASKS: TaskItem[] = [];
export const INITIAL_EXPENSES: ExpenseItem[] = [];
