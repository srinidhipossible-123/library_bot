import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, X } from 'lucide-react';
 

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  summary: string | null;
  available_copies: number;
  total_copies: number;
  location: string | null;
  publication_year: number | null;
  cover_url: string | null;
}

export default function BookSearch() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const genres = ['all', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Arts', 'Biography', 'Mystery', 'Romance', 'Fantasy'];

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, selectedGenre, availableOnly, books]);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '', filters: {} })
      });
      const data = await res.json();
      const mapped = (data || []).map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        genre: b.genre,
        summary: b.summary ?? null,
        available_copies: b.availability ?? 0,
        total_copies: b.copies ?? 0,
        location: b.location ?? null,
        publication_year: null,
        cover_url: b.cover_url ?? null
      })) as Book[];
      setBooks(mapped);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.genre.toLowerCase().includes(term)
      );
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter((book) => book.genre === selectedGenre);
    }

    if (availableOnly) {
      filtered = filtered.filter((book) => book.available_copies > 0);
    }

    setFilteredBooks(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, author, or genre..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show available only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredBooks.length} of {books.length} books
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex gap-4">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-28 bg-gradient-to-br from-blue-500 to-cyan-500 rounded shadow-sm flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-white opacity-80" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{book.author}</p>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                    {book.genre}
                  </span>
                </div>
              </div>

              {book.summary && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {book.summary}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      book.available_copies > 0
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {book.available_copies > 0 ? 'Available' : 'Unavailable'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {book.available_copies} of {book.total_copies} copies
                  </p>
                </div>
                {book.location && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">{book.location}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No books found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
