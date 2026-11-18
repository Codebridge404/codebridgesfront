/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0158
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface PosCategoryItem {
  id?: string | number;
  name?: string;
  slug?: string;
  [key: string]: any;
}

interface PosCategoryTabsProps {
  categories: (string | PosCategoryItem)[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function PosCategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: PosCategoryTabsProps) {
  // Normalize categories into unique, clean string labels
  const rawList = Array.isArray(categories) ? categories : [];
  const normalizedSet = new Set<string>();

  rawList.forEach((c) => {
    const name = typeof c === 'string' ? c.trim() : (c?.name || '').trim();
    if (name && name.toLowerCase() !== 'all') {
      normalizedSet.add(name);
    }
  });

  const allCategories = ['All', ...Array.from(normalizedSet)];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
      {allCategories.map((catName, idx) => {
        const isSelected = selectedCategory.trim().toLowerCase() === catName.trim().toLowerCase();
        return (
          <motion.button
            key={`pos-cat-tab-${catName}-${idx}`}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectCategory(catName)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              isSelected
                ? 'bg-brand text-white shadow-md shadow-brand/20 font-black'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            {catName}
          </motion.button>
        );
      })}
    </div>
  );
}

