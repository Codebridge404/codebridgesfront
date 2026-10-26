'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getAuthUser, getAuthToken } from '@/lib/api';
import { CreateOrgModal } from '@/components/tenant/CreateOrgModal';

export interface CreateOrgCalloutBannerProps {
  user?: any;
  className?: string;
  onOpenModal?: () => void;
  onOrgCreated?: (newOrg: { id: string | number; name: string; type: 'Personal' | 'Company' }) => void;
  useModal?: boolean; // if true, opens CreateOrgModal directly instead of navigating to /register-tenant
}

export function CreateOrgCalloutBanner({
  user: userProp,
  className = '',
  onOpenModal,
  onOrgCreated,
  useModal = true,
}: CreateOrgCalloutBannerProps) {
  const [currentUser, setCurrentUser] = useState<any>(userProp || null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userProp !== undefined) {
      setCurrentUser(userProp);
    } else {
      const token = getAuthToken();
      const u = token ? getAuthUser() : null;
      setCurrentUser(u);
    }
  }, [userProp]);

  // Listen to user and org updates
  useEffect(() => {
    const handleUserUpdate = () => {
      const u = getAuthUser();
      setCurrentUser(u);
    };
    window.addEventListener('cb_user_updated', handleUserUpdate);
    window.addEventListener('cb_org_changed', handleUserUpdate);
    return () => {
      window.removeEventListener('cb_user_updated', handleUserUpdate);
      window.removeEventListener('cb_org_changed', handleUserUpdate);
    };
  }, []);

  // Only display if user is logged in, has NO organization, and is NOT super_admin
  const shouldDisplay =
    currentUser &&
    !currentUser.tenant_id &&
    currentUser.role !== 'super_admin';

  if (!shouldDisplay) {
    return null;
  }

  const handleActionClick = () => {
    if (onOpenModal) {
      onOpenModal();
    } else if (useModal) {
      setShowModal(true);
    }
  };

  const handleCreated = (newOrg: { id: string | number; name: string; type: 'Personal' | 'Company' }) => {
    setShowModal(false);
    if (onOrgCreated) {
      onOrgCreated(newOrg);
    }
  };

  return (
    <>
      <div
        className={`bg-gradient-to-r from-brand/10 via-purple-50 to-brand/5 border border-brand/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs ${className}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Create Your Organization Workspace
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              You are currently signed in with a personal account. Set up your organization to activate modules, manage store outlets, and invite team members.
            </p>
          </div>
        </div>

        {useModal || onOpenModal ? (
          <button
            type="button"
            onClick={handleActionClick}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Organization</span>
          </button>
        ) : (
          <Link
            href="/register-tenant"
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Organization</span>
          </Link>
        )}
      </div>

      {/* Internal modal fallback when useModal=true and no external onOpenModal provided */}
      {useModal && !onOpenModal && (
        <CreateOrgModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onOrgCreated={handleCreated}
        />
      )}
    </>
  );
}
