'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch, getAuthUser } from '@/lib/api';
import {
  CreateOrgModalHeader,
  WorkspaceTypeSelector,
  CreateOrgFormFields,
  CreateOrgModalFooter,
} from './create-org';

export interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'personal' | 'company';
  onOrgCreated?: (newOrg: { id: string | number; name: string; type: 'Personal' | 'Company' }) => void;
}

interface CreatedTenantRecord {
  id?: string | number;
  name: string;
  company_code?: string;
  client_tier?: string;
  status?: string;
  [key: string]: unknown;
}

export function CreateOrgModal({
  isOpen,
  onClose,
  initialType = 'company',
  onOrgCreated,
}: CreateOrgModalProps) {
  const [mounted, setMounted] = useState(false);
  const [workspaceType, setWorkspaceType] = useState<'personal' | 'company'>(initialType);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('retail');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setWorkspaceType(initialType);
      setError('');
      setSuccess(false);

      const currentUser = getAuthUser();
      if (currentUser) {
        if (currentUser.email) setEmail(currentUser.email);
        if (currentUser.phone) setPhone(currentUser.phone);
      }
    }
  }, [isOpen, initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a valid workspace / organization name.');
      return;
    }

    setLoading(true);
    setError('');

    const tenantName = name.trim();

    try {
      // 1. Call backend auth-service API to register tenant & auto-create primary store outlet
      const res = await apiFetch('/tenants/register', {
        method: 'POST',
        body: JSON.stringify({
          name: tenantName,
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          industry,
          client_tier: workspaceType === 'personal' ? 'free_personal' : 'business_runner',
        }),
      });

      const createdOrgData: CreatedTenantRecord = res?.data || res;

      if (!createdOrgData || !createdOrgData.name) {
        throw new Error(res?.message || 'Failed to create organization. Invalid server response.');
      }

      // 2. Update active organization in local session
      if (typeof window !== 'undefined') {
        const currentUserStr = localStorage.getItem('pos_user');
        const currentUserObj = currentUserStr ? JSON.parse(currentUserStr) : {};
        const updatedRole = currentUserObj.role === 'super_admin' ? 'super_admin' : 'organization';
        const updatedUser = {
          ...currentUserObj,
          tenant_id: createdOrgData.id || currentUserObj.tenant_id,
          tenant_name: createdOrgData.name,
          company_name: createdOrgData.name,
          outlet_id: createdOrgData.outlet_id || currentUserObj.outlet_id,
          role: updatedRole,
        };
        localStorage.setItem('pos_user', JSON.stringify(updatedUser));
        localStorage.setItem('active_org', createdOrgData.name);

        // Dispatch global sync events to notify all components in real time
        window.dispatchEvent(
          new CustomEvent('cb_org_changed', {
            detail: { orgName: createdOrgData.name },
          })
        );
        window.dispatchEvent(
          new CustomEvent('cb_user_updated', {
            detail: { user: updatedUser },
          })
        );
      }

      // 3. Callback to parent component with real backend data
      if (onOrgCreated) {
        onOrgCreated({
          id: createdOrgData.id || createdOrgData.name,
          name: createdOrgData.name,
          type: workspaceType === 'personal' ? 'Personal' : 'Company',
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setError('');
        onClose();
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create organization on backend service.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 text-slate-800 my-auto max-h-[92vh] flex flex-col"
          >
            {/* Header Component */}
            <CreateOrgModalHeader onClose={handleClose} />

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Workspace created & activated successfully!</span>
                </div>
              )}

              {/* Type Selector Component */}
              <WorkspaceTypeSelector
                workspaceType={workspaceType}
                onSelectType={(type) => {
                  setWorkspaceType(type);
                  if (type === 'personal' && (name.includes('Enterprise') || name.includes('Company'))) {
                    setName('');
                  }
                }}
              />

              {/* Form Fields Component */}
              <CreateOrgFormFields
                workspaceType={workspaceType}
                name={name}
                setName={setName}
                industry={industry}
                setIndustry={setIndustry}
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
              />

              {/* Footer Actions Component */}
              <CreateOrgModalFooter
                loading={loading}
                success={success}
                onCancel={handleClose}
              />
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
