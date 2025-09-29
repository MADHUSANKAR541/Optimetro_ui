'use client';

import { useEffect } from 'react';

export function HealthPing() {
  useEffect(() => {
    const controller = new AbortController();
    const baseUrl = process.env.INDUCTION_API_URL || "https://optimetro-backend-cpo9.onrender.com";
    if (!baseUrl) return;
    fetch(`${baseUrl}/api/health`, { method: 'GET', signal: controller.signal })
      .catch(() => {});
    return () => {
      controller.abort();
    };
  }, []);
  return null;
}


