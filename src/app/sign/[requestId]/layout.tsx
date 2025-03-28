import React from 'react';

interface Props {
  children: React.ReactNode;
}

const SignLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  );
};

export default SignLayout; 