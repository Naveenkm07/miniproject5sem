import { useState, useCallback, useMemo } from 'react';
import { useMemories } from '../contexts/MemoryContext';
import MemoryCard from '../components/MemoryCard';
import SearchBar from '../components/SearchBar';
import LazyImage from '../components/LazyImage';
import { applyAllFilters } from '../utils/searchFilters';

const Gallery = ({ onOpenUpload, onOpenBulkUpload, onOpenMemoryDetail }) => {
  const { memories, toggleFavorite } = useMemories();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    dateRange: '',
    tags: '',
    favorites: false,
    sortBy: 'dateAdded-desc'
  });

  // Apply search and filters with memoization
  const filteredMemories = useMemo(() => {
    return applyAllFilters(memories, searchQuery, filters);
  }, [memories, searchQuery, filters]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Memory Gallery</h1>
        <div className="page-actions">
          <button className="btn btn--outline" onClick={onOpenBulkUpload}>
            📦 Bulk Upload
          </button>
          <button className="btn btn--primary" onClick={onOpenUpload}>
            Upload Memory
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filter Controls */}
      <SearchBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        totalResults={filteredMemories.length}
      />

      {/* Memories Grid */}
      <div className="memories-grid">
        {filteredMemories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No memories found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredMemories.map(memory => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onClick={onOpenMemoryDetail}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Gallery;
