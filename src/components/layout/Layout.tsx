
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, LogOut, Volume2 } from 'lucide-react';
import { speak } from '@/utils/speechSynthesis';
import VoiceIndicator from '@/components/ui/VoiceIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Announce the current page when it changes
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      '/': 'Welcome to Accessible Gaming',
      '/games': 'Games Menu',
      '/games/chess': 'Voice Chess Game',
      '/games/memory': 'Memory Card Game',
      '/settings': 'Settings Page',
    };
    
    const title = pageTitles[location.pathname] || 'Page not found';
    speak(title);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="glass-panel py-4 px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 focus-ring rounded-md px-2 py-1"
          onClick={() => speak('Home')}
        >
          <Volume2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium">Accessible Gaming</span>
        </Link>
        
        <VoiceIndicator />
      </header>
      
      <main className="flex-1 container py-8 animate-fade-in">
        {children}
      </main>
      
      <footer className="glass-panel py-4 px-6">
        <nav aria-label="Main Navigation">
          <ul className="flex items-center justify-center space-x-8">
            <li>
              <Link 
                to="/" 
                className={`flex flex-col items-center p-2 rounded-lg focus-ring ${location.pathname === '/' ? 'text-primary' : 'text-foreground hover:text-primary/90'}`}
                onClick={() => speak('Home')}
              >
                <Home className="h-6 w-6" />
                <span className="text-sm mt-1">Home</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/games" 
                className={`flex flex-col items-center p-2 rounded-lg focus-ring ${location.pathname.includes('/games') ? 'text-primary' : 'text-foreground hover:text-primary/90'}`}
                onClick={() => speak('Games')}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <span className="text-sm mt-1">Games</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className={`flex flex-col items-center p-2 rounded-lg focus-ring ${location.pathname === '/settings' ? 'text-primary' : 'text-foreground hover:text-primary/90'}`}
                onClick={() => speak('Settings')}
              >
                <Settings className="h-6 w-6" />
                <span className="text-sm mt-1">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </footer>
    </div>
  );
};

export default Layout;
