import { useState, useEffect } from 'react';
import { loadImage, removeBackground } from '@/lib/backgroundRemoval';

export const useBackgroundRemoval = (originalImageSrc: string) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let blobUrl: string | null = null;

    const processImage = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        // Load the image
        const img = await loadImage(originalImageSrc);

        // Remove background
        const blob = await removeBackground(img);

        // Create blob URL
        blobUrl = URL.createObjectURL(blob);
        setProcessedImageUrl(blobUrl);
      } catch (err) {
        console.error('Background removal failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to original image
        setProcessedImageUrl(originalImageSrc);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [originalImageSrc]);

  return { processedImageUrl, isProcessing, error };
};
