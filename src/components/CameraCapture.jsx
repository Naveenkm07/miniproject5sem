import { useState, useRef, useEffect } from 'react';
import { X, Camera, RotateCw, Check } from 'lucide-react';

const CameraCapture = ({ isOpen, onClose, onCapture, showToast }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      showToast('error', 'Failed to access camera. Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageData);
  };

  const handleSave = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
  };

  const handleClose = () => {
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <h2>📷 Camera</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            paddingBottom: '75%', // 4:3 aspect ratio
            background: '#000',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {loading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                textAlign: 'center'
              }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                <p>Starting camera...</p>
              </div>
            )}

            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Camera Controls */}
          <div style={{ padding: '16px' }}>
            {!capturedImage ? (
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleFlipCamera}
                  className="btn btn--outline btn--sm flex items-center gap-2"
                  disabled={loading}
                >
                  <RotateCw size={18} />
                  Flip
                </button>
                <button
                  onClick={handleCapture}
                  disabled={loading}
                  className="btn btn--primary px-8 py-3 rounded-full flex items-center gap-2"
                  style={{ fontSize: '1.1rem' }}
                >
                  <Camera size={24} />
                  Capture
                </button>
              </div>
            ) : (
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleRetake}
                  className="btn btn--outline"
                >
                  Retake
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn--primary flex items-center gap-2"
                >
                  <Check size={18} />
                  Use Photo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
