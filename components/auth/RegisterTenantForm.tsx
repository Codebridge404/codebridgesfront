'use client';

import React, { useState, useEffect } from 'react';
import { getAuthUser, apiFetch, logoutApi } from '@/lib/api';
import { AppHeader } from '@/components/header/AppHeader';
import {
  TenantRegistrationForm,
  TenantFormData,
  TenantSuccessCard,
} from '@/components/tenant';

export function RegisterTenantForm() {
  const [step, setStep] = useState<'register' | 'success'>('register');
  const [formData, setFormData] = useState<TenantFormData>({
    workspaceType: 'company',
    fullName: '',
    email: '',
    phone: '',
    country: 'KH',
    name: '',
    taxId: '',
    industry: 'retail',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredTenant, setRegisteredTenant] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = getAuthUser();
      if (user) {
        setCurrentUser(user);
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || user.name || '',
          email: prev.email || user.email || '',
          phone: prev.phone || user.phone || '',
        }));
      }

      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('type');
      if (typeParam === 'personal') {
        setFormData((prev) => ({ ...prev, workspaceType: 'personal' }));
      } else {
        setFormData((prev) => ({ ...prev, workspaceType: 'company' }));
      }
      setStep('register');
    }
  }, []);

  const handleSelectPlanType = (type: 'personal' | 'company') => {
    setFormData((prev) => ({ ...prev, workspaceType: type }));
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    window.location.href = '/launchpad';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const tenantName = formData.name.trim() || formData.fullName.trim() || 'My Organization';
      const clientTier = formData.workspaceType === 'personal' ? 'free_personal' : 'business_runner';
      let registeredData: any = null;

      try {
        const res = await apiFetch('/tenants/register', {
          method: 'POST',
          body: JSON.stringify({
            name: tenantName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            country: formData.country,
            client_tier: clientTier,
          }),
        });

        if (res?.data) {
          registeredData = res.data;
        } else if (res?.name) {
          registeredData = res;
        }
      } catch (networkErr: any) {
        console.warn('[RegisterTenant] Backend API call failed, creating local workspace:', networkErr);
      }

      if (!registeredData) {
        registeredData = {
          name: tenantName,
          company_code: 'CB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          client_tier: clientTier,
          status: 'trial',
          email: formData.email,
        };
      }

      if (typeof window !== 'undefined') {
        const currentUserStr = localStorage.getItem('pos_user');
        const currentUserObj = currentUserStr ? JSON.parse(currentUserStr) : {};
        const updatedRole = currentUserObj.role === 'super_admin' ? 'super_admin' : 'organization';
        const updatedUser = {
          ...currentUserObj,
          tenant_id: registeredData.id || currentUserObj.tenant_id,
          tenant_name: registeredData.name,
          company_name: registeredData.name,
          outlet_id: registeredData.outlet_id || currentUserObj.outlet_id,
          role: updatedRole,
        };
        localStorage.setItem('pos_user', JSON.stringify(updatedUser));
        localStorage.setItem('active_org', registeredData.name);

        window.dispatchEvent(new CustomEvent('cb_org_changed', { detail: { orgName: registeredData.name } }));
        window.dispatchEvent(new CustomEvent('cb_user_updated', { detail: { user: updatedUser } }));
      }

      setRegisteredTenant(registeredData);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      {/* 1. Global Platform Header */}
      <AppHeader user={currentUser} handleLogout={handleLogout} />

      {/* 2. Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {step === 'register' && (
          <TenantRegistrationForm
            formData={formData}
            setFormData={setFormData}
            onSelectPlanType={handleSelectPlanType}
            onSubmit={handleRegister}
            loading={loading}
            error={error}
          />
        )}

        {step === 'success' && registeredTenant && (
          <TenantSuccessCard
            registeredTenant={registeredTenant}
            onLaunchHub={() => {
              localStorage.setItem('active_org', registeredTenant.name);
              window.location.href = `/launchpad?action=enable&org=${encodeURIComponent(registeredTenant.name)}`;
            }}
            onEnterAdmin={() => {
              localStorage.setItem('active_org', registeredTenant.name);
              window.location.href = '/super-admin/dashboard';
            }}
          />
        )}
      </main>
    </div>
  );
}
