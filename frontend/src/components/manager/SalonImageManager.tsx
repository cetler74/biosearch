import React, { useState, useRef } from 'react';
import { Upload, X, Star, Trash2, Edit, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { imageAPI } from '../../utils/api';

// Inline types to avoid import issues
interface SalonImage {
  id: number;
  salon_id: number;
  image_url: string;
  image_alt?: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

interface SalonImageManagerProps {
  salonId: number;
  salonName: string;
  images: SalonImage[];
  onImagesChange: (images: SalonImage[]) => void;
}

const SalonImageManager: React.FC<SalonImageManagerProps> = ({
  salonId,
  salonName,
  images,
  onImagesChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editingImage, setEditingImage] = useState<SalonImage | null>(null);
  const [editForm, setEditForm] = useState({
    image_alt: '',
    is_primary: false,
    display_order: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadError('');

    try {
      // For now, we'll use a placeholder URL since we don't have a file upload service
      // In a real implementation, you would upload to a service like AWS S3, Cloudinary, etc.
      const imageUrl = URL.createObjectURL(file);
      
      const imageData = {
        image_url: imageUrl,
        image_alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        is_primary: images.length === 0, // First image is primary
        display_order: images.length
      };

      // Call the API to save the image
      const newImage = await imageAPI.addSalonImage(salonId, imageData);
      
      // Add to local state
      onImagesChange([...images, newImage]);

    } catch (error) {
      setUploadError('Failed to upload image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      // Update all images to set only the selected one as primary
      const updatedImages = images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }));
      
      // Call API to update the image
      await imageAPI.updateSalonImage(salonId, imageId, { is_primary: true });
      
      // Update local state
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Error setting primary image:', error);
      setUploadError('Failed to set primary image. Please try again.');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // Call API to delete the image
      await imageAPI.deleteSalonImage(salonId, imageId);
      
      const updatedImages = images.filter(img => img.id !== imageId);
      
      // If we deleted the primary image, make the first remaining image primary
      const deletedImage = images.find(img => img.id === imageId);
      if (deletedImage?.is_primary && updatedImages.length > 0) {
        updatedImages[0].is_primary = true;
        // Also update the new primary image in the database
        await imageAPI.updateSalonImage(salonId, updatedImages[0].id, { is_primary: true });
      }

      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Error deleting image:', error);
      setUploadError('Failed to delete image. Please try again.');
    }
  };

  const handleEditImage = (image: SalonImage) => {
    setEditingImage(image);
    setEditForm({
      image_alt: image.image_alt || '',
      is_primary: image.is_primary,
      display_order: image.display_order
    });
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      // Call API to update the image
      const updatedImage = await imageAPI.updateSalonImage(salonId, editingImage.id, {
        image_alt: editForm.image_alt,
        is_primary: editForm.is_primary,
        display_order: editForm.display_order
      });

      const updatedImages = images.map(img => {
        if (img.id === editingImage.id) {
          return updatedImage;
        }
        // If setting this image as primary, unset others
        if (editForm.is_primary && img.id !== editingImage.id) {
          return { ...img, is_primary: false };
        }
        return img;
      });

      onImagesChange(updatedImages);
      setEditingImage(null);
    } catch (error) {
      console.error('Error updating image:', error);
      setUploadError('Failed to update image. Please try again.');
    }
  };

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Salon Images</h3>
          <p className="text-sm text-gray-600">Manage images for {salonName}</p>
        </div>
        <div className="text-sm text-gray-500">
          {images.length} image{images.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Camera className="h-6 w-6 text-gray-400" />
          </div>
          
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn-primary inline-flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            {uploadError}
          </div>
        )}
      </div>

      {/* Images Grid */}
      {sortedImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedImages.map((image, index) => (
            <div key={image.id} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Image */}
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={image.image_url}
                  alt={image.image_alt || `Salon image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Primary
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditImage(image)}
                      className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                      title="Edit image"
                    >
                      <Edit className="h-3 w-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {image.image_alt || `Image ${index + 1}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    #{image.display_order + 1}
                  </span>
                </div>

                {/* Set Primary Button */}
                {!image.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    className="w-full text-xs py-1 px-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Set as Primary
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sortedImages.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No images yet</h4>
          <p className="text-gray-600 mb-4">
            Upload images to showcase your salon and attract more customers.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
          >
            Upload Your First Image
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Image</h3>
              <button
                onClick={() => setEditingImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Preview */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={editingImage.image_url}
                  alt={editingImage.image_alt || 'Edit image'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text (for accessibility)
                </label>
                <input
                  type="text"
                  value={editForm.image_alt}
                  onChange={(e) => setEditForm({ ...editForm, image_alt: e.target.value })}
                  placeholder="Describe this image..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.display_order}
                  onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={editForm.is_primary}
                  onChange={(e) => setEditForm({ ...editForm, is_primary: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_primary" className="ml-2 text-sm text-gray-700">
                  Set as primary image (shown first)
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingImage(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonImageManager;
