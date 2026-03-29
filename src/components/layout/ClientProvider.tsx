'use client';

import { useState, useEffect } from 'react';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
