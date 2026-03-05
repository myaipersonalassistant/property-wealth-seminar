
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import SEO from '@/components/SEO';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <SEO
        description="Join property investor and author Chris Ifonlaja for a 3-hour seminar on building wealth through real estate. Expert panel, live Q&A, Belfast March 2026. Book your seat — £25. All proceeds to charity."
        canonical="/"
        jsonLdEvent
      />
      <AppLayout />
    </AppProvider>
  );
};

export default Index;
