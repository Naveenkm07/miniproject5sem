/**
 * Performance Optimization Utilities
 * - Lazy loading
 * - Virtual scrolling
 * - Progressive loading
 * - Image optimization
 */

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (imageElement, src, placeholder = null) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px',
    });

    if (placeholder) {
      imageElement.src = placeholder;
    }
    observer.observe(imageElement);
    
    return () => observer.disconnect();
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    imageElement.src = src;
  }
};

/**
 * Create a low-quality placeholder from image
 */
export const createPlaceholder = (canvas, img, quality = 0.1) => {
  const ctx = canvas.getContext('2d');
  const scale = quality;
  
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/jpeg', 0.5);
};

/**
 * Compress image before upload/storage
 */
export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Debounce function for performance
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Calculate visible items for virtual scrolling
 */
export const calculateVisibleRange = (scrollTop, itemHeight, containerHeight, totalItems, overscan = 3) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex };
};

/**
 * Batch operations for better performance
 */
export const batchOperations = (operations, batchSize = 50) => {
  return new Promise((resolve) => {
    let currentIndex = 0;
    
    const processBatch = () => {
      const batch = operations.slice(currentIndex, currentIndex + batchSize);
      
      batch.forEach((operation) => operation());
      
      currentIndex += batchSize;
      
      if (currentIndex < operations.length) {
        requestAnimationFrame(processBatch);
      } else {
        resolve();
      }
    };
    
    processBatch();
  });
};

/**
 * Measure component render time
 */
export const measurePerformance = (componentName, callback) => {
  const start = performance.now();
  
  callback();
  
  const end = performance.now();
  const duration = end - start;
  
  if (duration > 16) { // Slower than 60fps
    console.warn(`${componentName} took ${duration.toFixed(2)}ms to render`);
  }
  
  return duration;
};

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback = window.requestIdleCallback || ((cb) => {
  const start = Date.now();
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1);
});

export const cancelIdleCallback = window.cancelIdleCallback || ((id) => {
  clearTimeout(id);
});

/**
 * Progressive image loading
 */
export const loadImageProgressively = (lowQualitySrc, highQualitySrc, onLoad) => {
  const lowQualityImg = new Image();
  const highQualityImg = new Image();
  
  lowQualityImg.onload = () => {
    onLoad(lowQualitySrc, false);
    
    highQualityImg.onload = () => {
      onLoad(highQualitySrc, true);
    };
    
    highQualityImg.src = highQualitySrc;
  };
  
  lowQualityImg.src = lowQualitySrc;
};

/**
 * Check if element is in viewport
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Preload critical resources
 */
export const preloadResources = (urls) => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Memory cleanup helper
 */
export const cleanupResources = (resources) => {
  resources.forEach((resource) => {
    if (resource instanceof Image) {
      resource.src = '';
    } else if (typeof resource === 'string' && resource.startsWith('blob:')) {
      URL.revokeObjectURL(resource);
    }
  });
};
