/**
 * Collaboration Features
 * - Comments on memories
 * - Collaborative albums
 * - Activity tracking
 */

/**
 * Get all comments for a memory
 */
export const getComments = (memoryId) => {
  try {
    const stored = localStorage.getItem(`comments_${memoryId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading comments:', error);
    return [];
  }
};

/**
 * Save comments for a memory
 */
export const saveComments = (memoryId, comments) => {
  try {
    localStorage.setItem(`comments_${memoryId}`, JSON.stringify(comments));
  } catch (error) {
    console.error('Error saving comments:', error);
  }
};

/**
 * Add a comment to a memory
 */
export const addComment = (memoryId, commentText, author = 'You') => {
  const comments = getComments(memoryId);
  
  const newComment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    memoryId,
    text: commentText,
    author,
    timestamp: new Date().toISOString(),
    edited: false
  };
  
  comments.push(newComment);
  saveComments(memoryId, comments);
  
  return newComment;
};

/**
 * Edit a comment
 */
export const editComment = (memoryId, commentId, newText) => {
  const comments = getComments(memoryId);
  const updated = comments.map(comment => {
    if (comment.id === commentId) {
      return {
        ...comment,
        text: newText,
        edited: true,
        editedAt: new Date().toISOString()
      };
    }
    return comment;
  });
  
  saveComments(memoryId, updated);
  return updated.find(c => c.id === commentId);
};

/**
 * Delete a comment
 */
export const deleteComment = (memoryId, commentId) => {
  const comments = getComments(memoryId);
  const filtered = comments.filter(c => c.id !== commentId);
  saveComments(memoryId, filtered);
  return true;
};

/**
 * Get comment count for a memory
 */
export const getCommentCount = (memoryId) => {
  return getComments(memoryId).length;
};

/**
 * Get all activity (comments, edits, etc.)
 */
export const getAllActivity = () => {
  const activity = [];
  
  // Get all comment keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('comments_')) {
      const memoryId = key.replace('comments_', '');
      const comments = getComments(memoryId);
      
      comments.forEach(comment => {
        activity.push({
          type: 'comment',
          memoryId,
          ...comment
        });
      });
    }
  }
  
  // Sort by timestamp
  return activity.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
};

/**
 * Share album settings
 */
export const getAlbumShareSettings = (albumId) => {
  try {
    const stored = localStorage.getItem(`album_share_${albumId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading share settings:', error);
    return null;
  }
};

/**
 * Save album share settings
 */
export const saveAlbumShareSettings = (albumId, settings) => {
  try {
    localStorage.setItem(`album_share_${albumId}`, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving share settings:', error);
  }
};

/**
 * Enable collaboration on album
 */
export const enableAlbumCollaboration = (albumId, settings = {}) => {
  const shareSettings = {
    enabled: true,
    allowComments: settings.allowComments !== false,
    allowContributions: settings.allowContributions || false,
    shareLink: generateShareLink(albumId),
    createdAt: new Date().toISOString(),
    ...settings
  };
  
  saveAlbumShareSettings(albumId, shareSettings);
  return shareSettings;
};

/**
 * Disable collaboration on album
 */
export const disableAlbumCollaboration = (albumId) => {
  localStorage.removeItem(`album_share_${albumId}`);
  return true;
};

/**
 * Generate a share link for an album
 */
const generateShareLink = (albumId) => {
  const baseUrl = window.location.origin;
  const shareId = btoa(albumId).replace(/=/g, '');
  return `${baseUrl}/#/shared/${shareId}`;
};

/**
 * Get collaborators for an album
 */
export const getCollaborators = (albumId) => {
  try {
    const stored = localStorage.getItem(`collaborators_${albumId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading collaborators:', error);
    return [];
  }
};

/**
 * Add collaborator to album
 */
export const addCollaborator = (albumId, collaborator) => {
  const collaborators = getCollaborators(albumId);
  
  const newCollaborator = {
    id: `collab_${Date.now()}`,
    name: collaborator.name,
    email: collaborator.email,
    role: collaborator.role || 'viewer', // viewer, editor, admin
    addedAt: new Date().toISOString()
  };
  
  collaborators.push(newCollaborator);
  localStorage.setItem(`collaborators_${albumId}`, JSON.stringify(collaborators));
  
  return newCollaborator;
};

/**
 * Remove collaborator from album
 */
export const removeCollaborator = (albumId, collaboratorId) => {
  const collaborators = getCollaborators(albumId);
  const filtered = collaborators.filter(c => c.id !== collaboratorId);
  localStorage.setItem(`collaborators_${albumId}`, JSON.stringify(filtered));
  return true;
};

/**
 * Update collaborator role
 */
export const updateCollaboratorRole = (albumId, collaboratorId, newRole) => {
  const collaborators = getCollaborators(albumId);
  const updated = collaborators.map(c => {
    if (c.id === collaboratorId) {
      return { ...c, role: newRole };
    }
    return c;
  });
  
  localStorage.setItem(`collaborators_${albumId}`, JSON.stringify(updated));
  return true;
};

/**
 * Track activity
 */
export const trackActivity = (action, details) => {
  try {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    const newActivity = {
      id: `activity_${Date.now()}`,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    
    activities.unshift(newActivity);
    
    // Keep only last 100 activities
    const trimmed = activities.slice(0, 100);
    localStorage.setItem('activities', JSON.stringify(trimmed));
    
    return newActivity;
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};

/**
 * Get recent activities
 */
export const getRecentActivities = (limit = 20) => {
  try {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error getting activities:', error);
    return [];
  }
};
