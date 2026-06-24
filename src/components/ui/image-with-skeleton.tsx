import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  skeletonClassName?: string;
  alt: string;
}

export function ImageWithSkeleton({
  className,
  skeletonClassName,
  alt,
  src,
  onLoad,
  onError,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Skeleton shown while loading */}
      {isLoading && !hasError && (
        <Skeleton className={cn("absolute inset-0", skeletonClassName)} />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-center p-4">
            <span className="text-4xl mb-2 block">🖼️</span>
            <span className="text-sm text-muted-foreground">Failed to load image</span>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={(e) => {
          setIsLoading(false);
          onLoad?.(e);
        }}
        onError={(e) => {
          setIsLoading(false);
          setHasError(true);
          onError?.(e);
        }}
        {...props}
      />
    </div>
  );
}

// Optimized portfolio image with proper aspect ratio and loading state
interface PortfolioImageProps extends ImageWithSkeletonProps {
  hoverScale?: boolean;
}

export function PortfolioImage({
  className,
  hoverScale = true,
  alt,
  ...props
}: PortfolioImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Shimmer skeleton effect */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      )}

      <img
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-700",
          isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
          hoverScale && "group-hover:scale-105"
        )}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

// Service card image component
export function ServiceImage({
  className,
  alt,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Validate alt text
  const validatedAlt = alt && alt.trim() ? alt : "Service image";

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/50" />
      )}
      <img
        alt={validatedAlt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100",
          "group-hover:scale-105 transition-transform duration-700"
        )}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

// Hero image component (eager loading for above-fold)
export function HeroImage({
  className,
  alt,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Validate alt text
  const validatedAlt = alt && alt.trim() ? alt : "Hero image";

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/50" />
      )}
      <img
        alt={validatedAlt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        loading="eager"
        {...props}
      />
    </div>
  );
}

// Client logo image with lazy loading
export function ClientLogoImage({
  className,
  alt,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Validate alt text
  const validatedAlt = alt && alt.trim() ? alt : "Client logo";

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/50" />
      )}
      <img
        alt={validatedAlt}
        className={cn(
          "w-full h-full object-contain transition-opacity duration-500 grayscale hover:grayscale-0",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
