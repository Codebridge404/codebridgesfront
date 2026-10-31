'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutGrid, Home, Compass } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/launchpad');
    }
  };

  return (
    <div className="relative h-screen max-h-screen w-screen overflow-hidden bg-transparent font-sans text-slate-900 selection:bg-brand selection:text-white flex flex-col items-center justify-center p-4">
      {/* Floating 404 Visual & Content - Direct on Tech Background (No Card Box) */}
      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl mx-auto text-center flex flex-col items-center justify-center px-4"
      >
        {/* Subtle Tech Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-subtle/80 border border-brand/20 text-brand text-xs font-semibold tracking-wide uppercase shadow-2xs mb-2 backdrop-blur-md"
        >
          <Compass className="w-3.5 h-3.5 text-brand" />
          <span>Error 404 • Destination Not Found</span>
        </motion.div>

        {/* Levitating 404 Illustration with Ground Shadow */}
        <div className="relative flex flex-col items-center justify-center select-none my-1">
          <motion.div
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4.2,
              ease: 'easeInOut',
            }}
            className="relative z-10"
          >
            <Image
              src="/404.svg"
              alt="404 Page Not Found"
              width={380}
              height={380}
              priority
              className="w-48 sm:w-60 md:w-72 h-auto drop-shadow-xl"
            />
          </motion.div>

          {/* Synchronized Levitating Ground Shadow */}
          <motion.div
            aria-hidden="true"
            animate={{
              scale: [1, 0.85, 1],
              opacity: [0.3, 0.16, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 4.2,
              ease: 'easeInOut',
            }}
            className="w-36 sm:w-48 h-3.5 rounded-full bg-slate-900/20 blur-sm -mt-2 pointer-events-none"
          />
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
          Page Not Found
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
          The requested page or route does not exist in your workspace or has been moved.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-200/80 shadow-xs backdrop-blur-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </motion.button>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/launchpad"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-hover shadow-md shadow-brand/25 transition-all cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Return to Launchpad</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </motion.div>
        </div>

        {/* Minimal Diagnostic Footnote */}
        <p className="mt-8 text-xs text-slate-400 font-mono">
          CodeBridges Platform • HTTP 404
        </p>
      </motion.main>
    </div>
  );
}
