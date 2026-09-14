import React, { useState, useEffect } from 'react';
import { Helmet as BaseHelmet } from 'react-helmet-async';

export function Helmet({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <BaseHelmet>{children}</BaseHelmet>;
}

export default Helmet;
