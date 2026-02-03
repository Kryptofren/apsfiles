// Helper function to draw text with styles
function renderTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, // Center X coordinate for text
  textSectionTopY: number, // Top Y of the section where text can be drawn
  textSectionHeight: number, // Total height of the section where text can be drawn
  maxWidth: number,
  textColor: string,
  textSize: number,
  // Removed: outlineColor: string,
  // Removed: outlineThickness: number,
  backgroundEnabled: boolean,
  backgroundColor: string,
  // Removed: shadowEnabled: boolean,
  // Removed: shadowColor: string,
) {
  ctx.font = `bold ${textSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top'; // Always use top baseline and adjust Y manually

  const estimatedLineHeight = textSize * 1.2; // Approximate line height
  const textPadding = 15; // Padding for background and text positioning

  let finalTextY = textSectionTopY;

  // Defaulting to top alignment since the feature was removed.
  finalTextY = textSectionTopY + textPadding;

  // Apply background if enabled
  if (backgroundEnabled) {
    // Measure text for accurate background width
    const textMetrics = ctx.measureText(text);
    const actualTextWidth = textMetrics.width;

    const bgWidth = actualTextWidth + 2 * textPadding;
    const bgHeight = estimatedLineHeight + 2 * textPadding;

    const bgX = x - bgWidth / 2; // Center horizontally
    const bgY = finalTextY - textPadding; // Position relative to finalTextY

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
  }

  // Removed: Shadow application logic
  ctx.shadowColor = 'transparent'; // Ensure shadow is reset
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Removed: Outline application logic
  ctx.lineWidth = 0; // Ensure no outline is drawn by default
  ctx.strokeStyle = 'transparent'; // Ensure no outline is drawn by default
  ctx.fillStyle = textColor;

  // Removed: if (outlineThickness > 0) { ctx.strokeText(text, x, finalTextY, maxWidth); }
  ctx.fillText(text, x, finalTextY, maxWidth);

  // Reset shadow for subsequent drawings (like the image)
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}


/**
 * Draws an image and text onto a canvas to create a meme.
 * The image is scaled to fit the canvas width, and vertically centered if its height exceeds the canvas height.
 * The text is placed at the top center with styling for readability.
 * @param canvas The HTMLCanvasElement to draw on.
 * @param imageSrc The data URL or path of the image to draw.
 * @param memeText The text to overlay on the image.
 * @param textColor The color for the meme text.
 * @param textSize The font size for the meme text in pixels.
 * @param backgroundEnabled True if a text background should be drawn.
 * @param backgroundColor The color for the text background.
 * @param textPosition Determines if text is drawn 'above-image' or 'below-image'.
 * @returns A Promise that resolves when drawing is complete, or rejects if the image fails to load.
 */
export function drawMemeOnCanvas(
  canvas: HTMLCanvasElement,
  imageSrc: string,
  memeText: string,
  textColor: string,
  textSize: number,
  // Removed: outlineColor: string,
  // Removed: outlineThickness: number,
  backgroundEnabled: boolean,
  backgroundColor: string,
  // Removed: shadowEnabled: boolean,
  // Removed: shadowColor: string,
  textPosition: 'above-image' | 'below-image', // Updated type
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Promise.reject('Could not get canvas 2D context.');
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const textHorizontalPadding = 40; // 20px on each side
      const textVerticalPaddingInner = 20; // Padding for text when at top/bottom of its section
      const maxWidth = canvas.width - textHorizontalPadding;
      const textX = canvas.width / 2;

      // Calculate estimated text height for canvas layout purposes.
      const estimatedLineHeight = textSize * 1.2;
      const estimatedTextSectionHeight = estimatedLineHeight + (textVerticalPaddingInner * 2);

      let imageAreaX = 0;
      let imageAreaY = 0;
      let imageAreaWidth = canvas.width;
      let imageAreaHeight = canvas.height;

      let textSectionTopY = 0;
      let textSectionTotalHeight = estimatedTextSectionHeight; // Default for above/below

      if (textPosition === 'above-image') {
        imageAreaY = estimatedTextSectionHeight;
        imageAreaHeight = canvas.height - estimatedTextSectionHeight;
        textSectionTopY = 0; // Text section starts at the very top
        textSectionTotalHeight = estimatedTextSectionHeight;
      } else if (textPosition === 'below-image') {
        imageAreaHeight = canvas.height - estimatedTextSectionHeight; // Image occupies top part of canvas
        textSectionTopY = imageAreaHeight; // Text section starts immediately below the image
        textSectionTotalHeight = estimatedTextSectionHeight;
      }
      // Removed: else if ('on-image') branch

      // --- Draw the Image ---
      // Scale image to fill the imageAreaWidth and center vertically within imageAreaHeight, cropping if necessary
      const imgAspectRatio = img.naturalHeight / img.naturalWidth;
      const imgDisplayWidth = imageAreaWidth;
      const imgDisplayHeight = imgDisplayWidth * imgAspectRatio; // What image would be if it fit width

      let finalImgDrawX = imageAreaX;
      let finalImgDrawY = imageAreaY;

      // Adjust image Y to center vertically within its designated imageArea, potentially cropping
      if (imgDisplayHeight > imageAreaHeight) {
        // Image is taller than its area, so crop by shifting its Y-position
        finalImgDrawY = imageAreaY - (imgDisplayHeight - imageAreaHeight) / 2;
      } else {
        // Image is shorter or fits, center it vertically within its area
        finalImgDrawY = imageAreaY + (imageAreaHeight - imgDisplayHeight) / 2;
      }

      ctx.drawImage(img, finalImgDrawX, finalImgDrawY, imgDisplayWidth, imgDisplayHeight);

      // --- Draw the Text ---
      renderTextOnCanvas(
        ctx,
        memeText,
        textX,
        textSectionTopY,
        textSectionTotalHeight,
        maxWidth,
        textColor,
        textSize,
        // Removed: outlineColor,
        // Removed: outlineThickness,
        backgroundEnabled,
        backgroundColor,
        // Removed: shadowEnabled,
        // Removed: shadowColor
      );

      resolve();
    };
    img.onerror = () => reject(new Error('Failed to load image.'));
    img.src = imageSrc;
  });
}

/**
 * Downloads the content of a canvas as a PNG image file.
 * @param canvas The HTMLCanvasElement to download.
 * @param filename The desired filename for the downloaded image (e.g., 'my-meme.png').
 */
export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string) {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link); // Required for Firefox to work
  link.click();
  document.body.removeChild(link);
}