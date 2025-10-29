/**
 * Smart Albums - Auto-generated albums based on criteria
 */

/**
 * Smart album types and their generation logic
 */
export const SMART_ALBUM_TYPES = {
  RECENT: 'recent',
  FAVORITES: 'favorites',
  BY_YEAR: 'by_year',
  BY_MONTH: 'by_month',
  BY_CATEGORY: 'by_category',
  BY_TAG: 'by_tag',
  PEOPLE: 'people',
  PLACES: 'places',
  CUSTOM: 'custom'
};

/**
 * Create a smart album definition
 */
export const createSmartAlbum = (type, criteria) => {
  return {
    id: `smart_${Date.now().toString(36)}`,
    type,
    criteria,
    isSmartAlbum: true,
    dateCreated: new Date().toISOString(),
    autoUpdate: true
  };
};

/**
 * Get memories matching smart album criteria
 */
export const getSmartAlbumMemories = (memories, smartAlbum) => {
  const { type, criteria } = smartAlbum;

  switch (type) {
    case SMART_ALBUM_TYPES.RECENT:
      return getRecentMemories(memories, criteria.days || 30);
    
    case SMART_ALBUM_TYPES.FAVORITES:
      return memories.filter(m => m.isFavorite);
    
    case SMART_ALBUM_TYPES.BY_YEAR:
      return getMemoriesByYear(memories, criteria.year);
    
    case SMART_ALBUM_TYPES.BY_MONTH:
      return getMemoriesByMonth(memories, criteria.year, criteria.month);
    
    case SMART_ALBUM_TYPES.BY_CATEGORY:
      return memories.filter(m => m.category === criteria.category);
    
    case SMART_ALBUM_TYPES.BY_TAG:
      return getMemoriesByTag(memories, criteria.tag);
    
    case SMART_ALBUM_TYPES.PEOPLE:
      return getMemoriesWithPeople(memories, criteria.person);
    
    case SMART_ALBUM_TYPES.PLACES:
      return getMemoriesByPlace(memories, criteria.place);
    
    case SMART_ALBUM_TYPES.CUSTOM:
      return evaluateCustomCriteria(memories, criteria);
    
    default:
      return [];
  }
};

/**
 * Get memories from the last N days
 */
const getRecentMemories = (memories, days) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return memories.filter(m => new Date(m.dateAdded) >= cutoff)
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
};

/**
 * Get memories from a specific year
 */
const getMemoriesByYear = (memories, year) => {
  return memories.filter(m => {
    const date = new Date(m.dateCreated);
    return date.getFullYear() === parseInt(year);
  });
};

/**
 * Get memories from a specific month and year
 */
const getMemoriesByMonth = (memories, year, month) => {
  return memories.filter(m => {
    const date = new Date(m.dateCreated);
    return date.getFullYear() === parseInt(year) && 
           date.getMonth() === parseInt(month);
  });
};

/**
 * Get memories with a specific tag
 */
const getMemoriesByTag = (memories, tag) => {
  return memories.filter(m => 
    m.tags && m.tags.some(t => 
      t.toLowerCase() === tag.toLowerCase()
    )
  );
};

/**
 * Get memories with a specific person
 */
const getMemoriesWithPeople = (memories, person) => {
  return memories.filter(m => 
    m.metadata?.people && m.metadata.people.some(p =>
      p.toLowerCase().includes(person.toLowerCase())
    )
  );
};

/**
 * Get memories from a specific place
 */
const getMemoriesByPlace = (memories, place) => {
  return memories.filter(m => 
    m.location && m.location.toLowerCase().includes(place.toLowerCase())
  );
};

/**
 * Evaluate custom criteria (advanced filtering)
 */
const evaluateCustomCriteria = (memories, criteria) => {
  return memories.filter(memory => {
    // Check all criteria
    for (const [key, value] of Object.entries(criteria)) {
      if (key === 'dateRange') {
        const date = new Date(memory.dateCreated);
        if (value.start && date < new Date(value.start)) return false;
        if (value.end && date > new Date(value.end)) return false;
      } else if (key === 'categories') {
        if (!value.includes(memory.category)) return false;
      } else if (key === 'tags') {
        const hasTag = memory.tags?.some(t => value.includes(t));
        if (!hasTag) return false;
      } else if (key === 'minRating') {
        if (!memory.metadata?.rating || memory.metadata.rating < value) return false;
      } else if (key === 'fileType') {
        if (memory.fileType !== value) return false;
      }
    }
    return true;
  });
};

/**
 * Generate default smart albums
 */
export const generateDefaultSmartAlbums = () => {
  const currentYear = new Date().getFullYear();
  
  return [
    {
      name: '⭐ Favorites',
      ...createSmartAlbum(SMART_ALBUM_TYPES.FAVORITES, {}),
      description: 'All your favorite memories',
      icon: '⭐'
    },
    {
      name: '🕐 Recent (30 days)',
      ...createSmartAlbum(SMART_ALBUM_TYPES.RECENT, { days: 30 }),
      description: 'Memories added in the last 30 days',
      icon: '🕐'
    },
    {
      name: `📅 ${currentYear}`,
      ...createSmartAlbum(SMART_ALBUM_TYPES.BY_YEAR, { year: currentYear }),
      description: `All memories from ${currentYear}`,
      icon: '📅'
    }
  ];
};

/**
 * Get all available years from memories
 */
export const getAvailableYears = (memories) => {
  const years = new Set();
  memories.forEach(m => {
    const year = new Date(m.dateCreated).getFullYear();
    years.add(year);
  });
  return Array.from(years).sort((a, b) => b - a);
};

/**
 * Get all available categories
 */
export const getAvailableCategories = (memories) => {
  const categories = new Set();
  memories.forEach(m => {
    if (m.category) categories.add(m.category);
  });
  return Array.from(categories).sort();
};

/**
 * Get all unique tags
 */
export const getAllTags = (memories) => {
  const tags = new Set();
  memories.forEach(m => {
    if (m.tags) {
      m.tags.forEach(tag => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
};

/**
 * Get all people mentioned in memories
 */
export const getAllPeople = (memories) => {
  const people = new Set();
  memories.forEach(m => {
    if (m.metadata?.people) {
      m.metadata.people.forEach(person => people.add(person));
    }
  });
  return Array.from(people).sort();
};

/**
 * Get all places mentioned in memories
 */
export const getAllPlaces = (memories) => {
  const places = new Set();
  memories.forEach(m => {
    if (m.location) places.add(m.location);
  });
  return Array.from(places).sort();
};
