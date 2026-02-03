import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { MemePreview } from './components/MemePreview';

const MEME_TEXT = "Guess who wasn't in the Epstein files?";

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = useCallback((imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
  }, []);

  const handleReset = useCallback(() => {
    setUploadedImage(null);
  }, []);

  return (
    <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-xl max-w-4xl w-full flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-8 text-center leading-tight">
        Epstein Files Meme Generator
      </h1>

      <p className="text-base sm:text-lg text-gray-300 mb-8 text-center max-w-2xl">
        Upload an image, and we'll add the classic meme text: <br />
        <span className="font-semibold italic">"{MEME_TEXT}"</span>
        <br /> Then, you can download your fresh meme!
      </p>

      <ImageUploader onImageUpload={handleImageUpload} />

      {uploadedImage && (
        <div className="mt-10 w-full">
          <MemePreview imageSrc={uploadedImage} memeText={MEME_TEXT} onReset={handleReset} />
        </div>
      )}
    </div>
  );
};

export default App;