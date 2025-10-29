// Search and filter utilities for memories

/**
 * Search memories by query string
 * Searches in title, description, and tags
 */
export const searchMemories = (memories, query) => {
  if (!query || query.trim() === '') {
    return memories;
  }

  const searchTerm = query.toLowerCase().trim();

  return memories.filter(memory => {
    // Search in title
    const titleMatch = memory.title?.toLowerCase().includes(searchTerm);

    // Search in description
    const descriptionMatch = memory.description?.toLowerCase().includes(searchTerm);

    // Search in tags
    const tagsMatch = memory.tags?.some(tag => 
      tag.toLowerCase().includes(searchTerm)
    );

    // Search in category
    const categoryMatch = memory.category?.toLowerCase().includes(searchTerm);

    return titleMatch || descriptionMatch || tagsMatch || categoryMatch;
  });
};

/**
 * Filter memories by category
 */
export const filterByCategory = (memories, category) => {
  if (!category) return memories;
  return memories.filter(memory => memory.category === category);
};

/**
 * Filter memories by date range
 */
export const filterByDateRange = (memories, dateRange) => {
  if (!dateRange) return memories;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return memories.filter(memory => {
    const memoryDate = new Date(memory.dateAdded);

    switch (dateRange) {
      case 'today':
        return memoryDate >= today;

      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return memoryDate >= weekAgo;
      }

      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return memoryDate >= monthAgo;
      }

      case 'year': {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return memoryDate >= yearAgo;
      }

      default:
        return true;
    }
  });
};

/**
 * Filter memories by tags
 * Supports multiple tags (comma-separated)
 */
export const filterByTags = (memories, tagsString) => {
  if (!tagsString || tagsString.trim() === '') return memories;

  const searchTags = tagsString
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0);

  if (searchTags.length === 0) return memories;

  return memories.filter(memory => {
    if (!memory.tags || memory.tags.length === 0) return false;

    const memoryTags = memory.tags.map(tag => tag.toLowerCase());

    // Return true if memory has ANY of the search tags
    return searchTags.some(searchTag =>
      memoryTags.some(memoryTag => memoryTag.includes(searchTag))
    );
  });
};

/**
 * Filter memories by favorites
 */
export const filterByFavorites = (memories, favoritesOnly) => {
  if (!favoritesOnly) return memories;
  return memories.filter(memory => memory.isFavorite === true);
};

/**
 * Sort memories by specified criteria
 */
export const sortMemories = (memories, sortBy) => {
  const sorted = [...memories];

  switch (sortBy) {
    case 'dateAdded-desc':
      return sorted.sort((a, b) => 
        new Date(b.dateAdded) - new Date(a.dateAdded)
      );

    case 'dateAdded-asc':
      return sorted.sort((a, b) => 
        new Date(a.dateAdded) - new Date(b.dateAdded)
      );

    case 'dateCreated-desc':
      return sorted.sort((a, b) => 
        new Date(b.dateCreated) - new Date(a.dateCreated)
      );

    case 'dateCreated-asc':
      return sorted.sort((a, b) => 
        new Date(a.dateCreated) - new Date(b.dateCreated)
      );

    case 'title-asc':
      return sorted.sort((a, b) => 
        (a.title || '').localeCompare(b.title || '')
      );

    case 'title-desc':
      return sorted.sort((a, b) => 
        (b.title || '').localeCompare(a.title || '')
      );

    default:
      return sorted;
  }
};

/**
 * Apply all filters and search to memories
 */
export const applyAllFilters = (memories, searchQuery, filters) => {
  let filtered = [...memories];

  // Apply search
  if (searchQuery) {
    filtered = searchMemories(filtered, searchQuery);
  }

  // Apply category filter
  if (filters.category) {
    filtered = filterByCategory(filtered, filters.category);
  }

  // Apply date range filter
  if (filters.dateRange) {
    filtered = filterByDateRange(filtered, filters.dateRange);
  }

  // Apply tags filter
  if (filters.tags) {
    filtered = filterByTags(filtered, filters.tags);
  }

  // Apply favorites filter
  if (filters.favorites) {
    filtered = filterByFavorites(filtered, true);
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered = sortMemories(filtered, filters.sortBy);
  }

  return filtered;
};

/**
 * Get unique tags from all memories
 */
export const getAllTags = (memories) => {
  const tagsSet = new Set();

  memories.forEach(memory => {
    if (memory.tags && Array.isArray(memory.tags)) {
      memory.tags.forEach(tag => {
        if (tag && tag.trim()) {
          tagsSet.add(tag.trim());
        }
      });
    }
  });

  return Array.from(tagsSet).sort();
};

/**
 * Get filter statistics
 */
export const getFilterStats = (memories) => {
  const stats = {
    total: memories.length,
    byCategory: {},
    favorites: 0,
    withTags: 0,
    uniqueTags: 0
  };

  memories.forEach(memory => {
    // Count by category
    const category = memory.category || 'Uncategorized';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

    // Count favorites
    if (memory.isFavorite) {
      stats.favorites++;
    }

    // Count memories with tags
    if (memory.tags && memory.tags.length > 0) {
      stats.withTags++;
    }
  });

  // Count unique tags
  stats.uniqueTags = getAllTags(memories).length;

  return stats;
};
