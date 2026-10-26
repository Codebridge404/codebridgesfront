'use client';

import React from 'react';
import { Tag, Layers, Edit3, Trash2, Loader2 } from 'lucide-react';
import { CategoryItem } from './types';

interface CategoryTableProps {
  categories: CategoryItem[];
  loading: boolean;
  onEdit: (cat: CategoryItem) => void;
  onDelete: (id: number, name: string) => void;
}

export function CategoryTable({
  categories,
  loading,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  if (loading) {
    return (
      <div className="py-14 text-center text-slate-400 font-medium">
        <Loader2 className="w-7 h-7 animate-spin mx-auto text-brand mb-2.5" />
        <span className="font-semibold text-slate-600">Loading catalog categories...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-14 text-center space-y-2">
        <Tag className="w-9 h-9 mx-auto text-slate-300 mb-1" />
        <p className="font-extrabold text-slate-700 text-sm">No Categories Found</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No categories found matching your criteria. Click "Add Main Category" to create one.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full border-separate border-spacing-0 text-xs">
      <thead className="sticky top-0 z-20 bg-canvas border-b border-slate-300/80 select-none text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
        <tr>
          <th className="sticky top-0 z-20 bg-canvas py-3 px-4 text-left border-b border-slate-300/80">Category Name</th>
          <th className="sticky top-0 z-20 bg-canvas py-3 px-4 text-left border-b border-slate-300/80">URL Slug</th>
          <th className="sticky top-0 z-20 bg-canvas py-3 px-4 text-left border-b border-slate-300/80">Type / Hierarchy</th>
          <th className="sticky top-0 z-20 bg-canvas py-3 px-4 text-right border-b border-slate-300/80">Products Assigned</th>
          <th className="sticky top-0 z-20 bg-canvas py-3 px-4 text-center border-b border-slate-300/80 w-[120px]">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200/80 bg-transparent">
        {categories.map((cat) => {
          const isSub = !!cat.parent_id;

          return (
            <tr
              key={cat.id}
              className="group hover:bg-[#d6e9fa] transition-colors text-xs"
            >
              <td className="py-3 px-4 font-bold text-slate-900 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  {isSub ? (
                    <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-brand-subtle border border-brand/20 flex items-center justify-center shrink-0">
                      <Tag className="w-3.5 h-3.5 text-brand" />
                    </div>
                  )}
                  <span className="font-extrabold text-slate-900">{cat.name}</span>
                </div>
              </td>

              <td className="py-3 px-4 font-mono text-[11px] text-slate-500 font-semibold border-b border-slate-200/60">
                {cat.slug}
              </td>

              <td className="py-3 px-4 border-b border-slate-200/60">
                {isSub ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Sub-Category of {cat.parent_name || 'Parent'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-subtle text-brand border border-brand/20">
                    Main Category
                  </span>
                )}
              </td>

              <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-mono border-b border-slate-200/60">
                <span className="px-2 py-0.5 rounded-lg bg-slate-200/50 border border-slate-300/60 text-xs">
                  {cat.products_count || 0}
                </span>
              </td>

              <td className="py-3 px-4 text-center border-b border-slate-200/60">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-brand hover:bg-brand-subtle transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
