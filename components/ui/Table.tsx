import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto border border-slate-300/80 rounded-2xl bg-transparent">
      <table className={cn('w-full caption-bottom text-xs font-sans text-left', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-transparent border-b border-slate-300/60', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-slate-200/80 bg-transparent', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('transition-colors hover:bg-slate-200/40 data-[state=selected]:bg-brand/10', className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3.5 text-xs text-slate-700 font-medium', className)} {...props} />;
}

export interface TableEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  colSpan?: number;
}

export function TableEmptyState({
  icon,
  title,
  description,
  action,
  colSpan = 1,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 px-4 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
            {icon || <Inbox className="w-5 h-5" />}
          </div>
          <h4 className="text-xs font-bold text-slate-800">{title}</h4>
          {description && <p className="text-[11px] text-slate-500 font-normal">{description}</p>}
          {action && <div className="pt-2">{action}</div>}
        </div>
      </td>
    </tr>
  );
}
