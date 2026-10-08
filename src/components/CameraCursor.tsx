'use client';

import React, { useEffect, useState, useRef } from 'react';

export const CameraCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const requestRef = useRef<number>();
  const targetPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Detect initial theme and watch for light/dark class changes on <html>
    const checkTheme = () => {
      if (typeof document !== 'undefined') {
        setIsLightMode(document.documentElement.classList.contains('light'));
      }
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    // Only run on devices with a mouse/pointer
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return () => observer.disconnect();
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'button, a, input, select, textarea, [role="button"], .clickable, .pro-card, .creator-card, .section-glow, label, [tabindex]'
        );
        setIsHovering(!!interactive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Smooth lerp frame loop for silky tracking
    let currentX = -100;
    let currentY = -100;

    const animateCursor = () => {
      const speed = 0.38; // Snappy yet smooth tracking
      currentX += (targetPos.current.x - currentX) * speed;
      currentY += (targetPos.current.y - currentY) * speed;

      setPosition({
        x: Math.round(currentX * 10) / 10,
        y: Math.round(currentY * 10) / 10,
      });

      requestRef.current = requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    requestRef.current = requestAnimationFrame(animateCursor);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 select-none will-change-transform"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Container centered on cursor hotspot (sleeker, smaller dimensions) */}
      <div className="relative -top-2.5 -left-2.5 flex items-center justify-center">
        
        {/* Outer Lens Viewfinder Ring (Decreased size, compact & elegant) */}
        <div 
          className={`absolute rounded-full transition-all duration-200 pointer-events-none ${
            isLightMode
              ? isClicking
                ? 'w-6 h-6 scale-90 border border-zinc-900 bg-zinc-900/20 shadow-[0_0_12px_rgba(0,0,0,0.3)]'
                : isHovering
                  ? 'w-7 h-7 scale-105 border border-zinc-900/80 bg-zinc-900/10 shadow-[0_0_10px_rgba(0,0,0,0.15)]'
                  : 'w-5 h-5 scale-100 border border-zinc-900/40'
              : isClicking
                ? 'w-6 h-6 scale-90 border border-white bg-white/25 shadow-[0_0_14px_rgba(255,255,255,0.7)]'
                : isHovering
                  ? 'w-7 h-7 scale-105 border border-white/80 bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.35)]'
                  : 'w-5 h-5 scale-100 border border-white/40'
          }`}
        >
          {/* Viewfinder Crosshair Ticks */}
          {isHovering && (
            <>
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-[1px] ${isLightMode ? 'bg-zinc-900' : 'bg-white'}`} />
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-[1px] ${isLightMode ? 'bg-zinc-900' : 'bg-white'}`} />
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-1 ${isLightMode ? 'bg-zinc-900' : 'bg-white'}`} />
              <span className={`absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-1 ${isLightMode ? 'bg-zinc-900' : 'bg-white'}`} />
            </>
          )}
        </div>

        {/* Compact Camera Symbol Icon (14x14 px, sleeker footprint) */}
        <div 
          className={`relative flex items-center justify-center transition-transform duration-150 ${
            isClicking ? 'scale-80' : isHovering ? 'scale-105' : 'scale-100'
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className={isLightMode ? 'filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]'}
          >
            {/* Camera Body */}
            <path
              d="M14.5 4h-5L7.5 6.5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-10a2 2 0 0 0-2-2h-3.5L14.5 4z"
              fill={
                isLightMode 
                  ? (isHovering ? '#09090B' : '#FFFFFF') 
                  : (isHovering ? '#FFFFFF' : '#18181B')
              }
              stroke={isLightMode ? '#09090B' : '#FFFFFF'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Camera Lens Aperture Circle */}
            <circle
              cx="12"
              cy="13"
              r="3.5"
              fill={
                isLightMode 
                  ? (isHovering ? '#FFFFFF' : '#E4E4E7') 
                  : (isHovering ? '#09090B' : '#27272A')
              }
              stroke={
                isLightMode 
                  ? (isHovering ? '#FFFFFF' : '#09090B') 
                  : (isHovering ? '#09090B' : '#FFFFFF')
              }
              strokeWidth="1.5"
            />
            {/* Center Focus Reticle Dot */}
            <circle
              cx="12"
              cy="13"
              r="1.1"
              fill={isHovering ? (isLightMode ? '#09090B' : '#FFFFFF') : '#38BDF8'}
            />
            {/* Flash / Sensor Indicator */}
            <circle
              cx="18"
              cy="9.5"
              r="0.8"
              fill={isLightMode ? '#09090B' : '#FFFFFF'}
            />
          </svg>

          {/* Flash burst ping on click */}
          {isClicking && (
            <span className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isLightMode ? 'bg-zinc-900' : 'bg-white'}`} />
          )}
        </div>

      </div>
    </div>
  );
};
