import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { UploadIcon } from './icons';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSave: (photoBase64: string) => void;
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose, title, onSave }) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPhotoPreview(null);
      setSelectedFile(null);
      setError('');
    }
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('File is too large. Please select an image under 2MB.');
        return;
      }
      setSelectedFile(file);
      const base64 = await toBase64(file);
      setPhotoPreview(base64);
    }
  };

  const handleSave = () => {
    if (photoPreview && selectedFile) {
      onSave(photoPreview);
    } else {
      setError('Please select a photo to upload.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-4 flex flex-col items-center gap-4">
        <div className="w-48 h-56 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden bg-background/50">
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-foreground/60">
              <UploadIcon className="w-10 h-10 mx-auto" />
              <p className="text-xs mt-2">Photo Preview</p>
            </div>
          )}
        </div>
        
        <label className="cursor-pointer w-full text-center py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors text-sm font-semibold">
          Choose Photo
          <input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} className="hidden" />
        </label>
        
        {error && <p className="text-red-500 text-xs">{error}</p>}
        
        <div className="w-full grid grid-cols-2 gap-2 mt-4">
            <button onClick={onClose} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white text-sm font-semibold transition-colors">
                Cancel
            </button>
            <button onClick={handleSave} disabled={!selectedFile} className="py-2 px-4 rounded-md bg-success text-success-foreground hover:bg-success-hover text-sm font-semibold transition-colors disabled:opacity-50">
                Upload & Generate
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default PhotoUploadModal;