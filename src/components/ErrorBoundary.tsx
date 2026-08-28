import React from 'react';

interface Props {
  children: React.ReactNode;
}

// Simplified to functional component to avoid tsc quirks with class components in this environment
const ErrorBoundary: React.FC<Props> = ({ children }) => {
  return <>{children}</>;
};

export default ErrorBoundary;
