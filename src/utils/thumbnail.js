/**
 * Thumbnail Generation Utility
 * Creates smaller preview images for faster gallery loading
 */

const THUMBNAIL_CONFIG = {
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.8,
  videoThumbnailTime: 1 // Extract frame at 1 second
};

/**
 * Generate thumbnail from image file
 * @param {File|Blob} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} Base64 data URL of thumbnail
 */
export const generateImageThumbnail = (
  file,
  maxWidth = THUMBNAIL_CONFIG.maxWidth,
  maxHeight = THUMBNAIL_CONFIG.maxHeight,
  quality = THUMBNAIL_CONFIG.quality
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to data URL
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(thumbnailDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Generate thumbnail from video file
 * @param {File} file - Video file
 * @param {number} seekTime - Time in seconds to extract frame
 * @returns {Promise<string>} Base64 data URL of thumbnail
 */
export const generateVideoThumbnail = (
  file,
  seekTime = THUMBNAIL_CONFIG.videoThumbnailTime
) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      // Seek to specific time
      video.currentTime = Math.min(seekTime, video.duration);
    };
    
    video.onseeked = () => {
      try {
        // Calculate dimensions
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        const maxWidth = THUMBNAIL_CONFIG.maxWidth;
        const maxHeight = THUMBNAIL_CONFIG.maxHeight;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Set canvas size and draw frame
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);
        
        // Convert to data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', THUMBNAIL_CONFIG.quality);
        
        // Clean up
        video.src = '';
        video.load();
        
        resolve(thumbnailDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
    
    // Load video
    const url = URL.createObjectURL(file);
    video.src = url;
  });
};

/**
 * Generate thumbnail based on file type
 * @param {File} file - File to generate thumbnail from
 * @returns {Promise<string|null>} Thumbnail data URL or null if not supported
 */
export const generateThumbnail = async (file) => {
  try {
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
      return await generateImageThumbnail(file);
    } else if (fileType.startsWith('video/')) {
      return await generateVideoThumbnail(file);
    } else {
      // No thumbnail for other types (audio, documents)
      return null;
    }
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
};

/**
 * Calculate size savings from using thumbnails
 * @param {string} fullDataUrl - Full size data URL
 * @param {string} thumbnailDataUrl - Thumbnail data URL
 * @returns {object} Size information
 */
export const calculateSizeSavings = (fullDataUrl, thumbnailDataUrl) => {
  const fullSize = fullDataUrl.length;
  const thumbSize = thumbnailDataUrl ? thumbnailDataUrl.length : fullSize;
  const savings = fullSize - thumbSize;
  const savingsPercent = Math.round((savings / fullSize) * 100);
  
  return {
    fullSize,
    thumbSize,
    savings,
    savingsPercent
  };
};

export default {
  generateThumbnail,
  generateImageThumbnail,
  generateVideoThumbnail,
  calculateSizeSavings,
  THUMBNAIL_CONFIG
};
