/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0141
 */

'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Briefcase, Building2, Phone, Mail, UserX, Edit3, Eye } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/mediaUtils';

interface EmployeeCardGridProps {
  employees: any[];
  loading: boolean;
  onEdit: (emp: any) => void;
  onDelete: (emp: any) => void;
  onView?: (emp: any) => void;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' as const },
  }),
};

export const EmployeeCardGrid: React.FC<EmployeeCardGridProps> = ({
  employees,
  loading,
  onEdit,
  onDelete,
  onView,
}) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 font-medium">
        Loading employees...
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
        <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">No employees found in directory</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((emp, idx) => (
        <motion.div
          key={emp.id}
          custom={idx}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className={`p-5 rounded-2xl bg-white border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
            emp.status === 'active'
              ? 'border-slate-200 hover:border-slate-300'
              : 'border-slate-200 opacity-60 bg-slate-50'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div
                className={`flex items-center gap-3 ${onView ? 'cursor-pointer group/emp' : ''}`}
                onClick={() => onView && onView(emp)}
                title={onView ? 'Click to view full employee profile' : undefined}
              >
                <div className="relative w-10 h-10 rounded-2xl bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 select-none">
                  <span>
                    {emp.first_name ? emp.first_name[0] : ''}
                    {emp.last_name ? emp.last_name[0] : ''}
                  </span>
                  {resolveMediaUrl(emp.avatar_url || emp.avatar || emp.photo_url || emp.logo_url) && (
                    <img
                      src={resolveMediaUrl(emp.avatar_url || emp.avatar || emp.photo_url || emp.logo_url)!}
                      alt={`${emp.first_name || ''} ${emp.last_name || ''}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div>
                  <h3 className={`font-bold text-slate-900 text-sm ${onView ? 'group-hover/emp:text-brand group-hover/emp:underline' : ''} transition-colors`}>
                    {emp.first_name} {emp.last_name}
                  </h3>
                  <p className="text-[11px] text-brand font-semibold">
                    {emp.designation || 'Staff Member'}
                  </p>
                </div>
              </div>

              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  emp.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {emp.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              {emp.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </p>
              )}
              {emp.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.phone}</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {emp.department_name || 'General Dept'} • {emp.outlet_name || 'Main Outlet'}
                </span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{emp.employment_type}</span>
              <span className="font-mono font-bold text-slate-900">
                ${parseFloat(emp.salary || '0').toFixed(2)}/mo
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            {onView && (
              <button
                type="button"
                onClick={() => onView(emp)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand hover:border-brand/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-white"
                title="View Full Profile"
              >
                <Eye className="w-3.5 h-3.5 text-brand" />
                <span>Profile</span>
              </button>
            )}
            <button
              onClick={() => onDelete(emp)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Terminate Staff Record"
            >
              <UserX className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(emp)}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
