import { useState, useCallback, useRef } from 'react';
import { X, RotateCw, RotateCcw, Maximize, Check, Sliders } from 'lucide-react';
import Cropper from 'react-easy-crop';

const PhotoEditor = ({ isOpen, image, onClose, onSave, showToast }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [activeTab, setActiveTab] = useState('crop'); // crop, filters, adjust
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0
  });

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const applyFilters = (imageData) => {
    const filterString = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
    `;
    return filterString;
  };

  const handleSave = async () => {
    try {
      let finalImage = image;

      // Apply crop if needed
      if (croppedAreaPixels) {
        finalImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      }

      // Apply filters
      if (Object.values(filters).some(v => v !== 100 && v !== 0)) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = await createImage(finalImage);

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.filter = applyFilters();
        ctx.drawImage(img, 0, 0);

        finalImage = canvas.toDataURL('image/jpeg', 0.95);
      }

      onSave(finalImage);
      showToast('success', 'Image edited successfully!');
      onClose();
    } catch (error) {
      console.error('Error editing image:', error);
      showToast('error', 'Failed to edit image');
    }
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '900px', height: '80vh' }}
      >
        <div className="modal-header">
          <h2>✂️ Photo Editor</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(80vh - 140px)' }}>
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            padding: '16px', 
            borderBottom: '1px solid var(--color-border)' 
          }}>
            <button
              className={`btn btn--sm ${activeTab === 'crop' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setActiveTab('crop')}
            >
              ✂️ Crop & Rotate
            </button>
            <button
              className={`btn btn--sm ${activeTab === 'filters' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setActiveTab('filters')}
            >
              🎨 Filters
            </button>
            <button
              className={`btn btn--sm ${activeTab === 'adjust' ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setActiveTab('adjust')}
            >
              <Sliders size={16} /> Adjust
            </button>
          </div>

          {/* Editor Area */}
          <div style={{ flex: 1, position: 'relative', background: '#000' }}>
            <div style={{ filter: applyFilters(), width: '100%', height: '100%' }}>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={activeTab === 'crop' ? undefined : 16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
              />
            </div>
          </div>

          {/* Controls */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
            {activeTab === 'crop' && (
              <div className="space-y-4">
                <div>
                  <label className="form-label text-sm">Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn btn--outline btn--sm flex items-center gap-2" onClick={handleRotateLeft}>
                    <RotateCcw size={16} /> Rotate Left
                  </button>
                  <button className="btn btn--outline btn--sm flex items-center gap-2" onClick={handleRotateRight}>
                    <RotateCw size={16} /> Rotate Right
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'filters' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFilters({ brightness: 120, contrast: 110, saturation: 120, blur: 0, grayscale: 0, sepia: 0 })}
                  className="btn btn--outline btn--sm"
                >
                  🌞 Vibrant
                </button>
                <button
                  onClick={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 100, sepia: 0 })}
                  className="btn btn--outline btn--sm"
                >
                  ⚫ Grayscale
                </button>
                <button
                  onClick={() => setFilters({ brightness: 110, contrast: 90, saturation: 100, blur: 0, grayscale: 0, sepia: 60 })}
                  className="btn btn--outline btn--sm"
                >
                  📜 Vintage
                </button>
                <button
                  onClick={resetFilters}
                  className="btn btn--outline btn--sm"
                >
                  🔄 Reset
                </button>
              </div>
            )}

            {activeTab === 'adjust' && (
              <div className="space-y-3">
                <div>
                  <label className="form-label text-sm flex justify-between">
                    <span>Brightness</span>
                    <span>{filters.brightness}%</span>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={filters.brightness}
                    onChange={(e) => setFilters({ ...filters, brightness: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="form-label text-sm flex justify-between">
                    <span>Contrast</span>
                    <span>{filters.contrast}%</span>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={filters.contrast}
                    onChange={(e) => setFilters({ ...filters, contrast: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="form-label text-sm flex justify-between">
                    <span>Saturation</span>
                    <span>{filters.saturation}%</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={filters.saturation}
                    onChange={(e) => setFilters({ ...filters, saturation: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn--outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary flex items-center gap-2" onClick={handleSave}>
            <Check size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;
