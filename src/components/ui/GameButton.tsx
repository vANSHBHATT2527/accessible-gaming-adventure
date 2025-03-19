
import React, { useState } from 'react';
import { triggerHaptics } from '@/utils/haptics';
import { speak } from '@/utils/speechSynthesis';

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  speakText?: string;
}

const GameButton: React.FC<GameButtonProps> = ({
  children,
  variant = 'primary',
  speakText,
  className = '',
  onClick,
  ...props
}) => {
  const [isRippling, setIsRippling] = useState(false);
  const [rippleX, setRippleX] = useState(0);
  const [rippleY, setRippleY] = useState(0);
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    accent: 'bg-accent text-white hover:bg-accent/90',
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRippleX(e.clientX - rect.left);
    setRippleY(e.clientY - rect.top);
    setIsRippling(true);
    
    triggerHaptics();
    
    if (speakText) {
      speak(speakText);
    }
    
    if (onClick) {
      onClick(e);
    }
    
    setTimeout(() => {
      setIsRippling(false);
    }, 500);
  };
  
  return (
    <button
      className={`relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 active:scale-95 focus:outline-none focus-ring ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {isRippling && (
        <span
          className="absolute animate-ripple"
          style={{
            left: rippleX,
            top: rippleY,
          }}
        />
      )}
    </button>
  );
};

export default GameButton;
