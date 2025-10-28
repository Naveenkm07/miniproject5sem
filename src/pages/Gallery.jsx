import { useMemories } from '../contexts/MemoryContext';
import MemoryCard from '../components/MemoryCard';

const Gallery = ({ onOpenUpload, onOpenBulkUpload, onOpenMemoryDetail }) => {
  const { filters, updateFilters, getFilteredMemories, toggleFavorite } = useMemories();
  const filteredMemories = getFilteredMemories();

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

      {/* Search and Filter Controls */}
      <div className="controls-section">
        <div className="search-section">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search memories..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>
        <div className="filter-section">
          <select
            className="form-control"
            value={filters.showFavorites || ''}
            onChange={(e) => updateFilters({ showFavorites: e.target.value })}
          >
            <option value="">All Memories</option>
            <option value="true">⭐ Favorites Only</option>
          </select>
          <select
            className="form-control"
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="Photos">📷 Photos</option>
            <option value="Videos">🎥 Videos</option>
            <option value="Audio">🎵 Audio</option>
            <option value="Documents">📄 Documents</option>
            <option value="Notes">📝 Notes</option>
          </select>
          <select
            className="form-control"
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
          >
            <option value="dateAdded">Date Added</option>
            <option value="dateCreated">Date Created</option>
            <option value="title">Title</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

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
