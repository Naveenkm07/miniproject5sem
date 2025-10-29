import { useState, useEffect, useRef } from 'react';

/**
 * Lazy Loading Image Component
 * Loads images only when they're about to enter the viewport
 */
const LazyImage = ({ 
  src, 
  alt, 
  placeholder = null, 
  className = '',
  style = {},
  onLoad = null 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        if (onLoad) onLoad();
      };
    }
  }, [isInView, src, onLoad]);

  return (
    <img
      ref={imgRef}
      src={imageSrc || placeholder}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0.6,
        transition: 'opacity 0.3s ease-in-out',
      }}
    />
  );
};

export default LazyImage;
