import { useState } from 'react';
import { BookOpen, MessageSquare, Search, User, LogOut, Moon, Sun, Library } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ChatInterface from '../Chat/ChatInterface';
import BookSearch from '../Books/BookSearch';
import BorrowedBooks from './BorrowedBooks';

type View = 'chat' | 'search' | 'borrowed';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>('chat');
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Smart Library Assistant
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Library System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user?.email?.split('@')[0]}
                </span>
              </div>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex gap-2 mb-8 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
          <button
            onClick={() => setActiveView('chat')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'chat'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            AI Assistant
          </button>
          <button
            onClick={() => setActiveView('search')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'search'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Search className="w-5 h-5" />
            Browse Books
          </button>
          <button
            onClick={() => setActiveView('borrowed')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'borrowed'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            My Books
          </button>
        </nav>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {activeView === 'chat' && (
            <div className="h-[calc(100vh-240px)]">
              <ChatInterface />
            </div>
          )}
          {activeView === 'search' && (
            <div className="p-6">
              <BookSearch />
            </div>
          )}
          {activeView === 'borrowed' && (
            <div className="p-6">
              <BorrowedBooks />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
