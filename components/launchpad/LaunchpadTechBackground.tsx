'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
}

export function LaunchpadTechBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const container = containerRef.current;
    if (!container) return;

    // Default mouse position to top-center
    mousePos.current = {
      x: window.innerWidth / 2,
      y: 220,
      active: true,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY + window.scrollY;
      mousePos.current.active = true;

      // Update CSS variables for fast 60fps spotlight gradient rendering
      container.style.setProperty('--mouse-x', `${e.clientX}px`);
      container.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    const handleMouseLeave = () => {
      mousePos.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Canvas particle constellation & magnetic proximity network
  useEffect(() => {
    if (!isClient) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = Math.max(window.innerHeight, document.body.scrollHeight || 1200));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = Math.max(window.innerHeight, document.body.scrollHeight || 1200);
    };
    window.addEventListener('resize', handleResize);

    // Generate responsive micro-particles
    const particleCount = Math.min(Math.floor(width / 38), 36);
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 1.2,
      baseAlpha: Math.random() * 0.35 + 0.15,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mX = mousePos.current.x;
      const mY = mousePos.current.y;
      const mActive = mousePos.current.active;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += 0.02;

        // Bounce at boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Proximity to cursor
        const dx = mX - p.x;
        const dy = mY - p.y;
        const dist = Math.hypot(dx, dy);
        const isNearCursor = mActive && dist < 180;

        const currentAlpha =
          p.baseAlpha + Math.sin(p.pulsePhase) * 0.1 + (isNearCursor ? (1 - dist / 180) * 0.4 : 0);

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, isNearCursor ? p.radius * 1.4 : p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isNearCursor
          ? `rgba(37, 99, 235, ${Math.min(currentAlpha + 0.2, 0.9)})`
          : `rgba(59, 130, 246, ${currentAlpha})`;
        ctx.fill();

        // Cursor magnetic tether line
        if (isNearCursor) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mX, mY);
          ctx.strokeStyle = `rgba(37, 99, 235, ${(1 - dist / 180) * 0.16})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Inter-particle constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pDist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (pDist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${(1 - pDist / 120) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isClient]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      style={
        {
          '--mouse-x': '50vw',
          '--mouse-y': '25vh',
        } as React.CSSProperties
      }
    >
      {/* 1. Fluid Ambient Aurora Blooms */}
      <div className="absolute top-[-10%] left-[-5%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-blue-400/12 via-indigo-400/8 to-transparent blur-3xl transform-gpu animate-pulse" />
      <div className="absolute top-[15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-cyan-400/12 via-blue-500/8 to-transparent blur-3xl transform-gpu" />
      <div className="absolute bottom-[-15%] left-[20%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-purple-400/10 via-sky-400/8 to-transparent blur-3xl transform-gpu" />

      {/* 2. Primary Engineering Tech Grid Pattern (SVG Tile) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 [mask-image:radial-gradient(ellipse_75%_75%_at_50%_35%,black_45%,transparent_95%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 36px Minor Grid */}
          <pattern id="launchpad-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="rgba(37, 99, 235, 0.08)"
              strokeWidth="0.8"
            />
          </pattern>
          {/* 144px Major Grid with Crosshairs */}
          <pattern id="launchpad-grid-major" width="144" height="144" patternUnits="userSpaceOnUse">
            <path
              d="M 144 0 L 0 0 0 144"
              fill="none"
              stroke="rgba(37, 99, 235, 0.15)"
              strokeWidth="1.2"
            />
            {/* Crosshair + Mark */}
            <path
              d="M 72 68 L 72 76 M 68 72 L 76 72"
              fill="none"
              stroke="rgba(37, 99, 235, 0.35)"
              strokeWidth="1.2"
            />
            {/* Corner Node Dots */}
            <circle cx="0" cy="0" r="1.5" fill="rgba(37, 99, 235, 0.4)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#launchpad-grid)" />
        <rect width="100%" height="100%" fill="url(#launchpad-grid-major)" />
      </svg>

      {/* 3. Dynamic Cursor Spotlight (Follows mouse in real time) */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(circle 380px at var(--mouse-x) var(--mouse-y), rgba(37, 99, 235, 0.11), transparent 80%),
            radial-gradient(circle 180px at var(--mouse-x) var(--mouse-y), rgba(6, 182, 212, 0.10), transparent 60%)
          `,
        }}
      />

      {/* 4. Illuminated Tech Grid Spotlight Overlay (Reveals crisp grid under cursor) */}
      <div
        className="absolute inset-0 [mask-image:radial-gradient(circle_320px_at_var(--mouse-x)_var(--mouse-y),black_20%,transparent_85%)] opacity-85"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#launchpad-grid-major)" />
        </svg>
      </div>

      {/* 5. Delicate Cyber Scanning Radar Wave */}
      <div className="absolute inset-x-0 h-48 bg-gradient-to-b from-transparent via-blue-500/[0.04] to-transparent animate-[launchpadScan_12s_ease-in-out_infinite]" />

      <style>{`
        @keyframes launchpadScan {
          0% { transform: translateY(-100%); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(120vh); opacity: 0; }
        }
      `}</style>

      {/* 6. High-Performance Canvas Micro-Particle Constellation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-75" />
    </div>
  );
}
