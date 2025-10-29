import { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, onFilterChange, totalResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    dateRange: '',
    tags: '',
    favorites: false,
    sortBy: 'dateAdded-desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      category: '',
      dateRange: '',
      tags: '',
      favorites: false,
      sortBy: 'dateAdded-desc'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v && v !== 'dateAdded-desc'
  ).length;

  return (
    <div className="search-bar-container">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search memories by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search-btn"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          title="Toggle filters"
        >
          🔧 Filters
          {activeFiltersCount > 0 && (
            <span className="filter-badge">{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {/* Results Count */}
      {(searchQuery || activeFiltersCount > 0) && (
        <div className="search-results-info">
          Found {totalResults} {totalResults === 1 ? 'memory' : 'memories'}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Category Filter */}
            <div className="filter-group">
              <label htmlFor="category-filter">Category</label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="Photos">📸 Photos</option>
                <option value="Videos">🎥 Videos</option>
                <option value="Audio">🎵 Audio</option>
                <option value="Documents">📄 Documents</option>
                <option value="Notes">📝 Notes</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="filter-group">
              <label htmlFor="date-filter">Date Range</label>
              <select
                id="date-filter"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="filter-select"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>

            {/* Tags Filter */}
            <div className="filter-group">
              <label htmlFor="tags-filter">Tags</label>
              <input
                id="tags-filter"
                type="text"
                placeholder="e.g., family, vacation"
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
                className="filter-input"
              />
              <small className="filter-hint">Separate multiple tags with commas</small>
            </div>

            {/* Sort By */}
            <div className="filter-group">
              <label htmlFor="sort-filter">Sort By</label>
              <select
                id="sort-filter"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="filter-select"
              >
                <option value="dateAdded-desc">📅 Newest First</option>
                <option value="dateAdded-asc">📅 Oldest First</option>
                <option value="dateCreated-desc">🕐 Created (New to Old)</option>
                <option value="dateCreated-asc">🕐 Created (Old to New)</option>
                <option value="title-asc">🔤 Title (A-Z)</option>
                <option value="title-desc">🔤 Title (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Favorites Toggle */}
          <div className="filter-group-inline">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.favorites}
                onChange={(e) => handleFilterChange('favorites', e.target.checked)}
              />
              <span>⭐ Show only favorites</span>
            </label>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || activeFiltersCount > 0) && (
            <div className="filter-actions">
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .search-bar-container {
          margin-bottom: 24px;
        }

        .search-input-wrapper {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .search-input-group {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          padding: 0 12px;
          transition: all 0.3s ease;
        }

        .search-input-group:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .search-icon {
          font-size: 1.2rem;
          margin-right: 8px;
          opacity: 0.6;
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 12px 8px;
          font-size: 0.95rem;
          color: var(--color-text);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--color-text-secondary);
        }

        .clear-search-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .clear-search-btn:hover {
          background: var(--color-secondary);
          color: var(--color-text);
        }

        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 20px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          color: var(--color-text);
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          position: relative;
        }

        .filter-toggle-btn:hover {
          border-color: var(--color-primary);
          background: var(--color-secondary);
        }

        .filter-toggle-btn.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .filter-badge {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .search-results-info {
          background: var(--color-secondary);
          padding: 8px 16px;
          border-radius: var(--radius-base);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
        }

        .filters-panel {
          background: var(--glass-bg);
          backdrop-filter: var(--backdrop-blur);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: 20px;
          margin-top: 12px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .filter-select,
        .filter-input {
          padding: 10px 12px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          color: var(--color-text);
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .filter-select:focus,
        .filter-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .filter-hint {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          font-style: italic;
        }

        .filter-group-inline {
          margin: 12px 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          color: var(--color-text);
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .filter-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--color-border);
        }

        .clear-filters-btn {
          padding: 10px 20px;
          background: var(--color-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-base);
          color: var(--color-text);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-filters-btn:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .search-input-wrapper {
            flex-direction: column;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .filter-toggle-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
