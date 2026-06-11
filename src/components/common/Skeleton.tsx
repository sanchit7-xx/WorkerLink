import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius,
  style = {}
}) => {
  const combinedStyle: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
    borderRadius: borderRadius || undefined,
    ...style
  };

  return (
    <div
      className={`loading-skeleton ${className}`}
      style={combinedStyle}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card" style={{ pointerEvents: 'none' }}>
      <div className="flex align-center" style={{ gap: '1rem', marginBottom: '1rem' }}>
        <Skeleton width="3rem" height="3rem" borderRadius="50%" />
        <div style={{ flexGrow: 1 }}>
          <Skeleton width="60%" height="1rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="40%" height="0.75rem" />
        </div>
      </div>
      <Skeleton width="100%" height="3rem" style={{ marginBottom: '1rem' }} />
      <div className="flex justify-between">
        <Skeleton width="30%" height="1rem" />
        <Skeleton width="25%" height="1.5rem" borderRadius="20px" />
      </div>
    </div>
  );
};
