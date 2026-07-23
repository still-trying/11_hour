import React from 'react';

interface ViewportContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ViewportContainer({
  children,
  className = '',
}: ViewportContainerProps): React.JSX.Element {
  return (
    <div
      className={`w-full max-w-7xl mx-auto px-sys-sm sm:px-sys-md lg:px-sys-lg xl:px-sys-xl py-sys-md sm:py-sys-lg flex flex-col min-h-screen ${className}`}
    >
      {children}
    </div>
  );
}
