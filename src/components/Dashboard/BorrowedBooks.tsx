import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BorrowedBook {
  id: string;
  borrowed_date: string;
  due_date: string;
  returned_date: string | null;
  status: 'active' | 'returned' | 'overdue';
  fine_amount: number;
  renewed_count: number;
  book: {
    title: string;
    author: string;
    genre: string;
    cover_url: string | null;
  };
}

export default function BorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBorrowedBooks();
    }
  }, [user]);

  const fetchBorrowedBooks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/borrowed?user_id=${user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch borrowed books');
      const data = await res.json();
      setBorrowedBooks(data || []);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeBooks = borrowedBooks.filter((b) => b.status === 'active' || b.status === 'overdue');
  const returnedBooks = borrowedBooks.filter((b) => b.status === 'returned');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Currently Borrowed</h2>
        {activeBooks.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">You haven't borrowed any books yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeBooks.map((borrowed) => {
              const daysUntilDue = getDaysUntilDue(borrowed.due_date);
              const isOverdue = borrowed.status === 'overdue';

              return (
                <div
                  key={borrowed.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
                    isOverdue
                      ? 'border-red-500'
                      : daysUntilDue <= 3
                      ? 'border-yellow-500'
                      : 'border-green-500'
                  }`}
                >
                  <div className="flex gap-4">
                    {borrowed.book.cover_url ? (
                      <img
                        src={borrowed.book.cover_url}
                        alt={borrowed.book.title}
                        className="w-16 h-24 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded shadow-sm" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {borrowed.book.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {borrowed.book.author}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                        {borrowed.book.genre}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Borrowed: {formatDate(borrowed.borrowed_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {isOverdue ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Overdue by {Math.abs(daysUntilDue)} days
                          </span>
                        </>
                      ) : daysUntilDue <= 3 ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                            Due in {daysUntilDue} days ({formatDate(borrowed.due_date)})
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 dark:text-green-400">
                            Due: {formatDate(borrowed.due_date)}
                          </span>
                        </>
                      )}
                    </div>
                    {borrowed.fine_amount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          Fine: ${borrowed.fine_amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {borrowed.renewed_count > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Renewed {borrowed.renewed_count} time(s)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {returnedBooks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Borrowing History</h2>
          <div className="space-y-3">
            {returnedBooks.slice(0, 5).map((borrowed) => (
              <div
                key={borrowed.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {borrowed.book.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {borrowed.book.author}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Returned: {formatDate(borrowed.returned_date!)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
