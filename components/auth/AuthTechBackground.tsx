'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SYSTEM_VERSION_DISPLAY } from '@/lib/version';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
}

export function AuthTechBackground() {
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

    // Default mouse position to center
    mousePos.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      active: true,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      mousePos.current.active = true;

      // 60fps CSS variable updates for smooth hardware-accelerated radial spotlight
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
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(Math.floor(width / 42), 32);
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.4 + 1.1,
      baseAlpha: Math.random() * 0.3 + 0.15,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mX = mousePos.current.x;
      const mY = mousePos.current.y;
      const mActive = mousePos.current.active;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += 0.02;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dx = mX - p.x;
        const dy = mY - p.y;
        const dist = Math.hypot(dx, dy);
        const isNearCursor = mActive && dist < 170;

        const currentAlpha =
          p.baseAlpha + Math.sin(p.pulsePhase) * 0.1 + (isNearCursor ? (1 - dist / 170) * 0.4 : 0);

        ctx.beginPath();
        ctx.arc(p.x, p.y, isNearCursor ? p.radius * 1.4 : p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isNearCursor
          ? `rgba(37, 99, 235, ${Math.min(currentAlpha + 0.25, 0.9)})`
          : `rgba(59, 130, 246, ${currentAlpha})`;
        ctx.fill();

        if (isNearCursor) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mX, mY);
          ctx.strokeStyle = `rgba(37, 99, 235, ${(1 - dist / 170) * 0.16})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pDist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (pDist < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${(1 - pDist / 115) * 0.16})`;
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
          '--mouse-y': '50vh',
        } as React.CSSProperties
      }
    >
      {/* 1. Central Ambient Security Halo & Aurora Clouds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-cyan-400/8 blur-3xl transform-gpu" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-400/12 via-indigo-400/8 to-transparent blur-3xl transform-gpu animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-400/10 via-blue-500/8 to-transparent blur-3xl transform-gpu" />

      {/* 2. Engineering Cyber-Grid Pattern (SVG Tile) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-45 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_45%,transparent_95%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="auth-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="rgba(37, 99, 235, 0.08)"
              strokeWidth="0.8"
            />
          </pattern>
          <pattern id="auth-grid-major" width="144" height="144" patternUnits="userSpaceOnUse">
            <path
              d="M 144 0 L 0 0 0 144"
              fill="none"
              stroke="rgba(37, 99, 235, 0.15)"
              strokeWidth="1.2"
            />
            <path
              d="M 72 68 L 72 76 M 68 72 L 76 72"
              fill="none"
              stroke="rgba(37, 99, 235, 0.35)"
              strokeWidth="1.2"
            />
            <circle cx="0" cy="0" r="1.5" fill="rgba(37, 99, 235, 0.4)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
        <rect width="100%" height="100%" fill="url(#auth-grid-major)" />
      </svg>

      {/* 3. Interactive Cursor Spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(circle 420px at var(--mouse-x) var(--mouse-y), rgba(37, 99, 235, 0.12), transparent 80%),
            radial-gradient(circle 200px at var(--mouse-x) var(--mouse-y), rgba(6, 182, 212, 0.10), transparent 60%)
          `,
        }}
      />

      {/* 4. Illuminated Grid Under Cursor */}
      <div
        className="absolute inset-0 [mask-image:radial-gradient(circle_340px_at_var(--mouse-x)_var(--mouse-y),black_25%,transparent_85%)] opacity-85"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#auth-grid-major)" />
        </svg>
      </div>

      {/* 5. Scanning Wave */}
      <div className="absolute inset-x-0 h-48 bg-gradient-to-b from-transparent via-blue-500/[0.04] to-transparent animate-[authScan_10s_ease-in-out_infinite]" />

      <style>{`
        @keyframes authScan {
          0% { transform: translateY(-100%); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>

      {/* 6. Canvas Particle Constellation */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />

      {/* 7. Cyber-Security Telemetry HUD Accents */}
      <div className="hidden md:flex justify-between items-center absolute top-0 inset-x-0 px-8 py-4 text-[10px] font-mono tracking-widest text-slate-400/80">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYS.SECURITY // IDENTITY-GATEWAY {SYSTEM_VERSION_DISPLAY}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            ZERO-TRUST ENCRYPTED
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>PORT: 443 // PROTOCOL: OIDC_SSO_v2</span>
        </div>
      </div>

      <div className="hidden md:flex justify-between items-center absolute bottom-0 inset-x-0 px-8 py-4 text-[10px] font-mono tracking-widest text-slate-400/70">
        <div>NODE: AUTH-CLUSTER-AP-SOUTHEAST</div>
        <div>ENCRYPTION: AES-256-GCM // TLS 1.3</div>
      </div>
    </div>
  );
}
