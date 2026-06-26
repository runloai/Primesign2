import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { src: string; alt?: string; label?: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageLightbox({ images, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const handleNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    onNavigate(nextIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handlePrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    onNavigate(prevIndex);
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // Prevent background scroll

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          key="image-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
            {currentImage.label && (
              <span className="ml-2 opacity-70">— {currentImage.label}</span>
            )}
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Main image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.src}
              alt={currentImage.alt || currentImage.label || "Portfolio image"}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </motion.div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[80vw] overflow-x-auto px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(idx);
                  }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    idx === currentIndex
                      ? "border-primary ring-2 ring-primary/50"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                >
                  <img
                    src={img.src}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing lightbox state
export function useLightbox(images: { src: string; alt?: string; label?: string }[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const open = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const navigate = (index: number) => {
    setCurrentIndex(index);
  };

  return {
    isOpen,
    currentIndex,
    open,
    close,
    navigate,
  };
}
