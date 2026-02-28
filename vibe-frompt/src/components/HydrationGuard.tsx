'use client';

import { ReactNode, useEffect, useState } from 'react';

export function HydrationGuard({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Avoid calling setState in effect - just delay rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsHydrated(true);
  }, []);

  return (
    <div suppressHydrationWarning>
      {isHydrated && children}
    </div>
  );
}
