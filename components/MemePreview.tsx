import React, { useRef, useEffect, useCallback, useState } from 'react';
import { drawMemeOnCanvas, downloadCanvasAsImage } from '../utils/imageProcessing';

interface MemePreviewProps {
  imageSrc: string;
  memeText: string;
  onReset: () => void; // New prop for resetting the image in the parent
}

type TextPosition = 'above-image' | 'below-image'; // Updated type: Removed 'on-image'
// Removed: type TextVerticalAlign = 'top' | 'middle' | 'bottom'; // New type for vertical alignment

export const MemePreview: React.FC<MemePreviewProps> = ({ imageSrc, memeText, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null); // Ref for the canvas container
  const [textColor, setTextColor] = useState<string>('#FFFFFF'); // Default to white
  const [textSize, setTextSize] = useState<number>(48); // Default to 48px
  // Removed: const [outlineColor, setOutlineColor] = useState<string>('#000000'); // Default to black
  // Removed: const [outlineThickness, setOutlineThickness] = useState<number>(4); // Default to 4px
  const [backgroundEnabled, setBackgroundEnabled] = useState<boolean>(false); // Default to no background
  const [backgroundColor, setBackgroundColor] = useState<string>('#000000'); // Default background color (black)
  // Removed: const [shadowEnabled, setShadowEnabled] = useState<boolean>(false); // Default to no shadow
  // Removed: const [shadowColor, setShadowColor] = useState<string>('#888888'); // Default shadow color (grey)
  const [textPosition, setTextPosition] = useState<TextPosition>('above-image'); // Default to text Above Image
  // Removed: const [textVerticalAlign, setTextVerticalAlign] = useState<TextVerticalAlign>('top'); // Default to top alignment
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 }); // Dynamic canvas size state

  // Function to reset all styling states to their defaults
  const resetStyles = useCallback(() => {
    setTextColor('#FFFFFF');
    setTextSize(48);
    // Removed: setOutlineColor('#000000');
    // Removed: setOutlineThickness(4);
    setBackgroundEnabled(false);
    setBackgroundColor('#000000');
    // Removed: setShadowEnabled(false);
    // Removed: setShadowColor('#888888');
    setTextPosition('above-image'); // Reset to default 'above-image'
    // Removed: setTextVerticalAlign('top');
  }, []);

  // Effect to handle dynamic canvas resizing and adjust for external text
  useEffect(() => {
    const updateCanvasSize = async () => {
      if (!canvasContainerRef.current) {
        // If container not available, set a default size and return
        setCanvasSize({ width: 800, height: 600 });
        return;
      }

      const containerWidth = canvasContainerRef.current.offsetWidth;
      const baseCanvasWidth = Math.min(containerWidth, 800); // Max width 800px

      let imageAreaHeight = 0;
      if (imageSrc) {
        const img = new Image();
        img.src = imageSrc;

        // Wait for image to load to get natural dimensions
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => {
            console.error("Failed to load image for canvas size calculation.");
            resolve(); // Resolve anyway to avoid blocking
          };
        });

        const imageAspectRatio = (img.naturalWidth && img.naturalHeight)
          ? img.naturalHeight / img.naturalWidth
          : 3 / 4; // Fallback to 3:4 aspect ratio if image dimensions unavailable

        imageAreaHeight = baseCanvasWidth * imageAspectRatio;
      } else {
        // If no image, use a default image area height based on 4:3 aspect
        imageAreaHeight = (baseCanvasWidth / 4) * 3;
      }


      let additionalTextHeight = 0;
      // Text position is always above or below image now, so it will always contribute to additional height
      // The condition `textPosition !== 'on-image'` is effectively always true.
      const estimatedLineHeight = textSize * 1.2; // Rough estimate for line height
      const textVerticalPadding = 20; // Top and bottom padding for external text area
      additionalTextHeight = estimatedLineHeight + (textVerticalPadding * 2);
      

      const totalCanvasHeight = imageAreaHeight + additionalTextHeight;

      setCanvasSize({ width: baseCanvasWidth, height: totalCanvasHeight });
    };

    updateCanvasSize(); // Call initially and on dependencies change

    // Use ResizeObserver for efficient resizing
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => {
      if (canvasContainerRef.current) {
        resizeObserver.unobserve(canvasContainerRef.current);
      }
    };
  }, [imageSrc, textPosition, textSize]); // Dependencies: imageSrc, textPosition, textSize

  // Redraw meme on canvas whenever imageSrc, memeText, or any styling option changes, or canvasSize changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && imageSrc) {
      // Set canvas dimensions based on dynamic state
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      drawMemeOnCanvas(
        canvas,
        imageSrc,
        memeText,
        textColor,
        textSize,
        // Removed: outlineColor,
        // Removed: outlineThickness,
        backgroundEnabled,
        backgroundColor,
        // Removed: shadowEnabled,
        // Removed: shadowColor,
        textPosition
        // Removed: textVerticalAlign // Pass new vertical align
      ).catch(console.error);
    }
  }, [
    imageSrc,
    memeText,
    textColor,
    textSize,
    // Removed: outlineColor,
    // Removed: outlineThickness,
    backgroundEnabled,
    backgroundColor,
    // Removed: shadowEnabled,
    // Removed: shadowColor,
    textPosition,
    // Removed: textVerticalAlign, // Add to dependencies
    canvasSize, // Add canvasSize to dependencies to trigger redraw on resize
  ]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      downloadCanvasAsImage(canvas, 'epstein-meme.png');
    }
  }, []);

  const handleFullReset = useCallback(() => {
    resetStyles(); // Reset all text styling options
    onReset(); // Call parent's reset to clear the image
  }, [resetStyles, onReset]);

  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-3xl font-bold text-gray-100 mb-6">Your Meme Preview</h2>
      {/* Responsive controls container */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 mb-6 w-full px-2 sm:px-4">
        {/* Text Color Picker */}
        <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2 w-full">
          <label htmlFor="textColor" className="text-base sm:text-lg text-gray-300 font-medium">
            Text Color:
          </label>
          <input
            type="color"
            id="textColor"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-10 w-10 rounded-md border-2 border-gray-600 cursor-pointer p-0.5"
            title="Select meme text color"
            aria-label="Select meme text color"
          />
        </div>

        {/* Text Size Slider */}
        <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2 w-full">
          <label htmlFor="textSize" className="text-base sm:text-lg text-gray-300 font-medium">
            Text Size:
          </label>
          <div className="flex items-center gap-2 w-full">
            <input
              type="range"
              id="textSize"
              min="20"
              max="100"
              step="2"
              value={textSize}
              onChange={(e) => setTextSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              title="Select meme text size"
              aria-label="Select meme text size"
            />
            <span className="text-gray-300 font-semibold w-10 text-right">{textSize}px</span>
          </div>
        </div>

        {/* Removed: Outline Color Picker */}
        {/*
        <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2 w-full">
          <label htmlFor="outlineColor" className="text-base sm:text-lg text-gray-300 font-medium">
            Outline Color:
          </label>
          <input
            type="color"
            id="outlineColor"
            value={outlineColor}
            onChange={(e) => setOutlineColor(e.target.value)}
            className="h-10 w-10 rounded-md border-2 border-gray-600 cursor-pointer p-0.5"
            title="Select meme text outline color"
            aria-label="Select meme text outline color"
          />
        </div>
        */}

        {/* Removed: Outline Thickness Slider */}
        {/*
        <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2 w-full">
          <label htmlFor="outlineThickness" className="text-base sm:text-lg text-gray-300 font-medium">
            Outline Thickness:
          </label>
          <div className="flex items-center gap-2 w-full">
            <input
              type="range"
              id="outlineThickness"
              min="0"
              max="10"
              step="1"
              value={outlineThickness}
              onChange={(e) => setOutlineThickness(Number(e.target.value))}
              className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer`}
              title="Select meme text outline thickness"
              aria-label="Select meme text outline thickness"
            />
            <span className="text-gray-300 font-semibold w-10 text-right">{outlineThickness}px</span>
          </div>
        </div>
        */}

        {/* Background Enabled Checkbox and Color Picker */}
        <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2 w-full">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="backgroundEnabled"
              checked={backgroundEnabled}
              onChange={(e) => setBackgroundEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              aria-label="Enable text background"
            />
            <label htmlFor="backgroundEnabled" className="text-base sm:text-lg text-gray-300 font-medium">
              Text Background:
            </label>
          </div>
          <input
            type="color"
            id="backgroundColor"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className={`h-10 w-10 rounded-md border-2 border-gray-600 cursor-pointer p-0.5 ${!backgroundEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Select meme text background color"
            aria-label="Select meme text background color"
            disabled={!backgroundEnabled}
          />
        </div>

        {/* Removed: Shadow Enabled Checkbox and Color Picker */}
        {/*
        <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2 w-full">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="shadowEnabled"
              checked={shadowEnabled}
              onChange={(e) => setShadowEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              aria-label="Enable text shadow"
            />
            <label htmlFor="shadowEnabled" className="text-base sm:text-lg text-gray-300 font-medium">
              Text Shadow:
            </label>
          </div>
          <input
            type="color"
            id="shadowColor"
            value={shadowColor}
            onChange={(e) => setShadowColor(e.target.value)}
            className={`h-10 w-10 rounded-md border-2 border-gray-600 cursor-pointer p-0.5 ${!shadowEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Select meme text shadow color"
            aria-label="Select meme text shadow color"
            disabled={!shadowEnabled}
          />
        </div>
        */}

        {/* Text Position Radio Buttons */}
        <fieldset className="flex flex-col gap-2 w-full">
          <legend className="sr-only">Text Position:</legend>
          <span className="text-base sm:text-lg text-gray-300 font-medium block mb-1">Text Position:</span>
          <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="positionAboveImage"
                name="textPosition"
                value="above-image"
                checked={textPosition === 'above-image'}
                onChange={() => setTextPosition('above-image')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600"
                aria-label="Text position above image"
              />
              <label htmlFor="positionAboveImage" className="text-gray-300 whitespace-nowrap">Above Image</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="positionBelowImage"
                name="textPosition"
                value="below-image"
                checked={textPosition === 'below-image'}
                onChange={() => setTextPosition('below-image')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600"
                aria-label="Text position below image"
              />
              <label htmlFor="positionBelowImage" className="text-gray-300 whitespace-nowrap">Below Image</label>
            </div>
          </div>
        </fieldset>
      </div>

      {/* Canvas container with dynamic width and max-w */}
      <div ref={canvasContainerRef} className="relative border-4 border-gray-600 rounded-lg overflow-hidden shadow-lg w-full max-w-[800px]">
        <canvas ref={canvasRef} className="block"></canvas>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 mt-8">
        <button
          onClick={handleDownload}
          className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
        >
          Download Meme
        </button>
        <button
          onClick={handleFullReset}
          className="px-8 py-3 bg-red-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};