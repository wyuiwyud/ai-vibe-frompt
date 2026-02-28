'use client';

import { ReactNode, useEffect, useState } from 'react';

export function HydrationGuard({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div suppressHydrationWarning>
      {isHydrated && children}
    </div>
  );
}
