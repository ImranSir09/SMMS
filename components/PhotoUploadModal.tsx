
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { UploadIcon } from './icons';

interface Point { x: number; y: number; }
interface Crop { x: number; y: number; width: number; height: number; }

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSave: (photoBase64: string) => void;
  aspectRatio?: number;
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose, title, onSave, aspectRatio = 4 / 5 }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ x: 10, y: 10, width: 80, height: 80 / aspectRatio });
  const [error, setError] = useState('');

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDragging: false, isResizing: false, startPoint: { x: 0, y: 0 }, startCrop: { x: 0, y: 0, width: 0, height: 0 }, resizeHandle: '' });

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setImageSrc(null);
        setError('');
        setCrop({ x: 10, y: 10, width: 80, height: 80 / aspectRatio });
      }, 300);
    }
  }, [isOpen, aspectRatio]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Please select an image under 5MB.');
        return;
      }
      const base64 = await toBase64(file);
      setImageSrc(base64);
    }
  };

  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent): Point => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const touch = 'touches' in e ? e.touches[0] : e;
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, handle?: string) => {
    e.preventDefault();
    const pos = getPointerPosition(e);
    dragState.current = { isDragging: !handle, isResizing: !!handle, startPoint: pos, startCrop: { ...crop }, resizeHandle: handle || '' };
  }, [crop]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.current.isDragging && !dragState.current.isResizing) return;
    e.preventDefault();

    const { startPoint, startCrop, isDragging, isResizing, resizeHandle } = dragState.current;
    const pos = getPointerPosition(e);
    const dx = pos.x - startPoint.x;
    const dy = pos.y - startPoint.y;

    let newCrop = { ...startCrop };

    if (isDragging) {
      newCrop.x = startCrop.x + dx;
      newCrop.y = startCrop.y + dy;
    } else if (isResizing) {
      let newWidth = startCrop.width;
      let newHeight = startCrop.height;
      let newX = startCrop.x;
      let newY = startCrop.y;

      if (resizeHandle.includes('right')) newWidth = startCrop.width + dx;
      if (resizeHandle.includes('left')) { newWidth = startCrop.width - dx; newX = startCrop.x + dx; }
      if (resizeHandle.includes('bottom')) newHeight = startCrop.height + dy;
      if (resizeHandle.includes('top')) { newHeight = startCrop.height - dy; newY = startCrop.y + dy; }
      
      if (newWidth < 10) newWidth = 10;
      if (newHeight < 10) newHeight = 10;
      
      if(aspectRatio){
        const dominantResizeHandle = resizeHandle.includes('left') || resizeHandle.includes('right') ? 'width' : 'height';
        if(dominantResizeHandle === 'width'){
            newHeight = newWidth / aspectRatio;
        } else {
            newWidth = newHeight * aspectRatio;
        }
      }
      
      if (resizeHandle.includes('top')) newY = startCrop.y + startCrop.height - newHeight;
      if (resizeHandle.includes('left')) newX = startCrop.x + startCrop.width - newWidth;

      newCrop = { x: newX, y: newY, width: newWidth, height: newHeight };
    }

    if(newCrop.width > 100) newCrop.width = 100;
    if(newCrop.height > 100) newCrop.height = 100;
    if (newCrop.x < 0) { newCrop.x = 0; }
    if (newCrop.y < 0) { newCrop.y = 0; }
    if (newCrop.x + newCrop.width > 100) { newCrop.x = 100 - newCrop.width; }
    if (newCrop.y + newCrop.height > 100) { newCrop.y = 100 - newCrop.height; }

    setCrop(newCrop);
  }, [aspectRatio]);

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
    dragState.current.isResizing = false;
  }, []);

  const handleSave = () => {
    const image = imageRef.current;
    if (!image || !image.complete || image.naturalWidth === 0) {
        setError("Image not loaded correctly. Please try another one.");
        return;
    };

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const pixelCrop = {
      x: (crop.x / 100) * image.width * scaleX,
      y: (crop.y / 100) * image.height * scaleY,
      width: (crop.width / 100) * image.width * scaleX,
      height: (crop.height / 100) * image.height * scaleY
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      0, 0, pixelCrop.width, pixelCrop.height
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    onSave(base64Image);
  };
  
  const resizeHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  
  const cropBoxStyle: React.CSSProperties = {
      position: 'absolute', left: `${crop.x}%`, top: `${crop.y}%`,
      width: `${crop.width}%`, height: `${crop.height}%`,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
      border: '1px solid white', cursor: 'move',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div 
        className="p-4 flex flex-col items-center gap-4"
        onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
      >
        {!imageSrc ? (
          <>
            <div className="w-full h-56 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-background/50">
                <label className="text-center text-foreground/60 cursor-pointer p-4">
                  <UploadIcon className="w-10 h-10 mx-auto" />
                  <p className="text-sm mt-2 font-semibold">Click to upload an image</p>
                  <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                  <input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} className="hidden" />
                </label>
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          </>
        ) : (
          <div ref={containerRef} className="relative w-full max-w-sm select-none" style={{ aspectRatio: '1 / 1' }}>
            <img ref={imageRef} src={imageSrc} alt="To crop" className="w-full h-full object-contain" crossOrigin="anonymous"/>
            <div style={cropBoxStyle} onMouseDown={(e) => handleMouseDown(e)} onTouchStart={(e) => handleMouseDown(e)}>
              {resizeHandles.map(handle => (
                <div key={handle}
                  className={`absolute w-3 h-3 bg-white rounded-full border border-gray-500 ${handle.includes('top') ? '-top-1.5' : '-bottom-1.5'} ${handle.includes('left') ? '-left-1.5' : '-right-1.5'}`}
                  style={{ cursor: `${handle.includes('top-left') || handle.includes('bottom-right') ? 'nwse-resize' : 'nesw-resize'}`}}
                  onMouseDown={(e) => handleMouseDown(e, handle)} onTouchStart={(e) => handleMouseDown(e, handle)}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="w-full grid grid-cols-2 gap-2 mt-2">
            <button onClick={onClose} className="py-3 px-5 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white text-sm font-semibold transition-colors">
                Cancel
            </button>
            <button onClick={handleSave} disabled={!imageSrc} className="py-3 px-5 rounded-md bg-success text-success-foreground hover:bg-success-hover text-sm font-semibold transition-colors disabled:opacity-50">
                Save Photo
            </button>
        </div>
        {imageSrc && <button onClick={() => setImageSrc(null)} className="text-sm text-primary hover:underline p-2">Choose another image</button>}
      </div>
    </Modal>
  );
};

export default PhotoUploadModal;