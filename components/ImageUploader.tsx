import React, { useCallback, ChangeEvent } from 'react';

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full max-w-md bg-gray-700 p-6 rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-400 transition-colors duration-200">
      <label htmlFor="image-upload" className="block text-center cursor-pointer">
        <svg
          className="mx-auto h-12 w-12 text-gray-300"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m-4-4l5.172 5.172a4 4 0 005.656 0L40 32M28 8a4 4 0 014 4v20m-32-4h12l4-4m0 0l4-4m0 0h4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm font-medium text-gray-300">
          <span className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
            Upload a file
          </span>
          <input
            id="image-upload"
            name="image-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
          />
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
      </label>
    </div>
  );
};