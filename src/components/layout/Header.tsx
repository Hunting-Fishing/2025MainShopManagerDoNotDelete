
import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { HeaderActions } from '@/components/layout/HeaderActions';
import { GlobalCommandMenu } from '@/components/search/GlobalCommandMenu';

export function Header() {
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  // Add keyboard shortcuts for command menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K to open command menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white py-3 px-6">
      <div className="flex items-center justify-between">
        <SearchBar />
        <HeaderActions onOpenCommandMenu={() => setIsCommandMenuOpen(true)} />
      </div>
      
      <GlobalCommandMenu 
        open={isCommandMenuOpen} 
        onOpenChange={setIsCommandMenuOpen}
        onSearch={(query) => {
          setIsCommandMenuOpen(false);
        }}
      />
    </header>
  );
}
