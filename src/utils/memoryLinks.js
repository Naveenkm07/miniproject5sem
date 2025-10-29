/**
 * Memory Linking - Create relationships between memories
 */

/**
 * Link types
 */
export const LINK_TYPES = {
  RELATED: 'related',
  SEQUENCE: 'sequence', // Part of a series
  BEFORE_AFTER: 'before_after',
  SAME_EVENT: 'same_event',
  SAME_PEOPLE: 'same_people',
  SAME_PLACE: 'same_place',
  CUSTOM: 'custom'
};

/**
 * Create a link between two memories
 */
export const createMemoryLink = (fromMemoryId, toMemoryId, linkType, metadata = {}) => {
  return {
    id: `link_${Date.now().toString(36)}`,
    fromMemoryId,
    toMemoryId,
    linkType,
    metadata,
    dateCreated: new Date().toISOString()
  };
};

/**
 * Get or initialize memory links from storage
 */
export const getMemoryLinks = () => {
  try {
    const stored = localStorage.getItem('memoria-vault-links');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading memory links:', error);
    return [];
  }
};

/**
 * Save memory links to storage
 */
export const saveMemoryLinks = (links) => {
  try {
    localStorage.setItem('memoria-vault-links', JSON.stringify(links));
  } catch (error) {
    console.error('Error saving memory links:', error);
  }
};

/**
 * Add a link between memories
 */
export const addMemoryLink = (fromMemoryId, toMemoryId, linkType, metadata = {}) => {
  const links = getMemoryLinks();
  
  // Check if link already exists
  const exists = links.some(link =>
    (link.fromMemoryId === fromMemoryId && link.toMemoryId === toMemoryId) ||
    (link.fromMemoryId === toMemoryId && link.toMemoryId === fromMemoryId)
  );
  
  if (exists) {
    return false;
  }
  
  const newLink = createMemoryLink(fromMemoryId, toMemoryId, linkType, metadata);
  links.push(newLink);
  saveMemoryLinks(links);
  
  return newLink;
};

/**
 * Remove a link
 */
export const removeMemoryLink = (linkId) => {
  const links = getMemoryLinks();
  const filtered = links.filter(link => link.id !== linkId);
  saveMemoryLinks(filtered);
  return true;
};

/**
 * Get all links for a specific memory
 */
export const getLinksForMemory = (memoryId) => {
  const links = getMemoryLinks();
  return links.filter(link =>
    link.fromMemoryId === memoryId || link.toMemoryId === memoryId
  );
};

/**
 * Get linked memories for a specific memory
 */
export const getLinkedMemories = (memoryId, memories) => {
  const links = getLinksForMemory(memoryId);
  
  return links.map(link => {
    const linkedMemoryId = link.fromMemoryId === memoryId 
      ? link.toMemoryId 
      : link.fromMemoryId;
    
    const memory = memories.find(m => m.id === linkedMemoryId);
    
    return {
      link,
      memory
    };
  }).filter(item => item.memory);
};

/**
 * Auto-suggest links based on similarity
 */
export const suggestMemoryLinks = (memory, allMemories) => {
  const suggestions = [];
  
  allMemories.forEach(otherMemory => {
    if (otherMemory.id === memory.id) return;
    
    let score = 0;
    let linkType = LINK_TYPES.RELATED;
    
    // Same event (date within 1 day)
    const dateDiff = Math.abs(
      new Date(memory.dateCreated) - new Date(otherMemory.dateCreated)
    );
    if (dateDiff < 24 * 60 * 60 * 1000) {
      score += 30;
      linkType = LINK_TYPES.SAME_EVENT;
    }
    
    // Same location
    if (memory.location && otherMemory.location &&
        memory.location.toLowerCase() === otherMemory.location.toLowerCase()) {
      score += 25;
      if (linkType === LINK_TYPES.RELATED) {
        linkType = LINK_TYPES.SAME_PLACE;
      }
    }
    
    // Same people
    if (memory.metadata?.people && otherMemory.metadata?.people) {
      const commonPeople = memory.metadata.people.filter(person =>
        otherMemory.metadata.people.includes(person)
      );
      if (commonPeople.length > 0) {
        score += commonPeople.length * 15;
        if (linkType === LINK_TYPES.RELATED) {
          linkType = LINK_TYPES.SAME_PEOPLE;
        }
      }
    }
    
    // Same tags
    if (memory.tags && otherMemory.tags) {
      const commonTags = memory.tags.filter(tag =>
        otherMemory.tags.includes(tag)
      );
      score += commonTags.length * 10;
    }
    
    // Same category
    if (memory.category === otherMemory.category) {
      score += 10;
    }
    
    // Add to suggestions if score is high enough
    if (score >= 20) {
      suggestions.push({
        memory: otherMemory,
        score,
        suggestedLinkType: linkType
      });
    }
  });
  
  // Sort by score and return top 5
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

/**
 * Get memory sequences (ordered series)
 */
export const getMemorySequences = (memories) => {
  const links = getMemoryLinks();
  const sequenceLinks = links.filter(link => link.linkType === LINK_TYPES.SEQUENCE);
  
  // Group into sequences
  const sequences = [];
  const visited = new Set();
  
  sequenceLinks.forEach(link => {
    if (visited.has(link.id)) return;
    
    // Build sequence starting from this link
    const sequence = [link.fromMemoryId, link.toMemoryId];
    visited.add(link.id);
    
    // Find connected links
    let changed = true;
    while (changed) {
      changed = false;
      
      sequenceLinks.forEach(otherLink => {
        if (visited.has(otherLink.id)) return;
        
        if (otherLink.fromMemoryId === sequence[sequence.length - 1]) {
          sequence.push(otherLink.toMemoryId);
          visited.add(otherLink.id);
          changed = true;
        } else if (otherLink.toMemoryId === sequence[0]) {
          sequence.unshift(otherLink.fromMemoryId);
          visited.add(otherLink.id);
          changed = true;
        }
      });
    }
    
    sequences.push(sequence);
  });
  
  // Convert IDs to memory objects
  return sequences.map(seq => 
    seq.map(id => memories.find(m => m.id === id)).filter(Boolean)
  );
};

/**
 * Remove all links for a memory (cleanup when deleting)
 */
export const removeMemoryLinks = (memoryId) => {
  const links = getMemoryLinks();
  const filtered = links.filter(link =>
    link.fromMemoryId !== memoryId && link.toMemoryId !== memoryId
  );
  saveMemoryLinks(filtered);
};
