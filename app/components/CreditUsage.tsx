'use client';

import { useEffect, useState } from 'react';

export default function CreditUsage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
    // Fetch credits every 5 minutes
    const interval = setInterval(fetchCredits, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits');
      const data = await response.json();
      setCredits(data.remaining_credits);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-sm">
      <span className="text-gray-700 dark:text-gray-300">Credits: </span>
      <span className="font-mono">{credits?.toFixed(2) ?? '---'}</span>
    </div>
  );
}