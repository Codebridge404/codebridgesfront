'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Check, Loader2, Sparkles, Store, Boxes, Users, DollarSign,
  Briefcase, Zap, CalendarClock, UtensilsCrossed, Tv, ShoppingBag,
  Layers, Activity, Shield, Sliders, Cpu, Globe, Bot, Monitor,
  HeartHandshake, CircleDollarSign, Calendar, LucideIcon,
  Upload, Image as ImageIcon, Trash2
} from 'lucide-react';
import { ModuleCard } from '@/components/ui';
import { useToast } from '@/components/common';
import { PlatformModuleRecord, createPlatformModuleApi, updatePlatformModuleApi } from '@/lib/api/modules';

export const ICON_MAP: Record<string, LucideIcon> = {
  Store, Boxes, Users, DollarSign, Briefcase, Zap, CalendarClock,
  UtensilsCrossed, Tv, ShoppingBag, Layers, Activity, Shield, Sliders,
  Cpu, Globe, Bot, Monitor, HeartHandshake, CircleDollarSign, Calendar,
};

export const PRESET_MODULE_LOGOS = [
  { label: 'POS Terminal', path: '/module/pos.svg' },
  { label: 'Inventory Suite', path: '/module/invetory.svg' },
  { label: 'Staff & HRM', path: '/module/hr.svg' },
  { label: 'Accounting & Finance', path: '/module/financial.svg' },
  { label: 'Customer Loyalty CRM', path: '/module/management.svg' },
  { label: 'Billing Subscription', path: '/module/subscription.svg' },
  { label: 'Meetings MMS', path: '/module/meeting-time.svg' },
  { label: 'Workspace Multi-Tenant', path: '/module/Workspace.svg' },
];

const COLOR_PRESETS = [
  { id: 'blue', name: 'Brand Blue', pill: 'bg-brand-subtle text-brand', card: 'bg-blue-50/70 border-blue-200/90 hover:border-blue-400' },
  { id: 'emerald', name: 'Emerald', pill: 'bg-emerald-50 text-emerald-700', card: 'bg-emerald-50/70 border-emerald-200/90 hover:border-emerald-400' },
  { id: 'rose', name: 'Rose', pill: 'bg-rose-50 text-rose-600', card: 'bg-rose-50/70 border-rose-200/90 hover:border-rose-400' },
  { id: 'purple', name: 'Purple', pill: 'bg-purple-50 text-purple-700', card: 'bg-purple-50/70 border-purple-200/90 hover:border-purple-400' },
  { id: 'amber', name: 'Amber', pill: 'bg-amber-50 text-amber-700', card: 'bg-amber-50/70 border-amber-200/90 hover:border-amber-400' },
  { id: 'sky', name: 'Sky Cyan', pill: 'bg-sky-50 text-sky-700', card: 'bg-sky-50/70 border-sky-200/90 hover:border-sky-400' },
  { id: 'indigo', name: 'Indigo', pill: 'bg-indigo-50 text-indigo-700', card: 'bg-indigo-50/70 border-indigo-200/90 hover:border-indigo-400' },
];

const CATEGORY_PRESETS = [
  'Core Commerce & Operations',
  'Supply Chain & Warehousing',
  'Workforce Management',
  'Customer Growth',
  'Financial Operations & Ledgers',
  'Finance & Billing',
  'Corporate Facilities & Space Operations',
  'Kitchen & Fulfillment',
  'Hardware & Terminal',
  'Digital Commerce',
  'Custom Extensions',
];

interface PlatformModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  module?: PlatformModuleRecord | null;
  onSaved: () => void;
}

export function PlatformModuleModal({ isOpen, onClose, module, onSaved }: PlatformModuleModalProps) {
  const toast = useToast();
  const isEditing = Boolean(module);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [monogram, setMonogram] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [description, setDescription] = useState('');
  const [href, setHref] = useState('');
  const [icon, setIcon] = useState('Store');
  const [colorTheme, setColorTheme] = useState(COLOR_PRESETS[0].id);
  const [isCore, setIsCore] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Icon / Logo Branding Mode: 'upload' | 'preset' | 'vector'
  const [iconMode, setIconMode] = useState<'upload' | 'preset' | 'vector'>('vector');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoData, setLogoData] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (module) {
      setName(module.name);
      setSlug(module.id);
      setMonogram(module.monogram);
      setCategory(module.category);
      setDescription(module.description);
      setHref(module.href);
      setIcon(module.icon || 'Store');
      setIsCore(Boolean(module.is_core));
      setIsActive(Boolean(module.is_active));
      setLogoUrl(module.logo_url || null);
      setLogoData(null);

      if (module.logo_url) {
        if (module.logo_url.startsWith('/module/')) {
          setIconMode('preset');
          setCustomUrl('');
        } else {
          setIconMode('upload');
          setCustomUrl(module.logo_url);
        }
      } else {
        setIconMode('vector');
        setCustomUrl('');
      }

      const matchedTheme = COLOR_PRESETS.find((p) => p.card === module.card_bg) || COLOR_PRESETS[0];
      setColorTheme(matchedTheme.id);
    } else {
      setName('');
      setSlug('');
      setMonogram('');
      setCategory(CATEGORY_PRESETS[0]);
      setDescription('');
      setHref('');
      setIcon('Store');
      setColorTheme(COLOR_PRESETS[0].id);
      setIsCore(false);
      setIsActive(true);
      setLogoUrl(null);
      setLogoData(null);
      setIconMode('vector');
      setCustomUrl('');
    }
    setError(null);
  }, [module, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
      const mono = val.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
      setMonogram(mono);
      if (!href) setHref(`/${generatedSlug}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoData(result);
      setLogoUrl(result);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const currentTheme = COLOR_PRESETS.find((p) => p.id === colorTheme) || COLOR_PRESETS[0];
  const IconComp = ICON_MAP[icon] || Store;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !description.trim() || !href.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError(null);

    // Determine final logo payload
    let resolvedLogoUrl: string | null | undefined = undefined;
    let resolvedLogoData: string | undefined = undefined;

    if (iconMode === 'vector') {
      resolvedLogoUrl = null;
    } else if (iconMode === 'preset') {
      resolvedLogoUrl = logoUrl;
    } else if (iconMode === 'upload') {
      if (logoData) {
        resolvedLogoData = logoData;
      } else if (customUrl.trim()) {
        resolvedLogoUrl = customUrl.trim();
      } else {
        resolvedLogoUrl = logoUrl;
      }
    }

    const payload: Partial<PlatformModuleRecord> & { logo_data?: string } = {
      id: slug || undefined,
      name: name.trim(),
      monogram: monogram.trim() || name.slice(0, 3).toUpperCase(),
      category: category.trim(),
      description: description.trim(),
      icon,
      href: href.trim(),
      bg_pill: currentTheme.pill,
      card_bg: currentTheme.card,
      is_core: isCore,
      is_active: isActive,
      logo_url: resolvedLogoUrl,
      logo_data: resolvedLogoData,
    };

    try {
      const res = isEditing
        ? await updatePlatformModuleApi(module!.id, payload)
        : await createPlatformModuleApi(payload);

      if (res?.success) {
        toast.success(
          isEditing
            ? `Module "${name.trim()}" has been updated successfully!`
            : `Module "${name.trim()}" has been registered to the platform!`,
          isEditing ? 'Module Updated' : 'Module Registered'
        );
        onSaved();
        onClose();
      } else {
        const msg = res?.message || 'Failed to save module. Please verify input.';
        setError(msg);
        toast.error(msg, 'Save Failed');
      }
    } catch (err: any) {
      const msg = err?.message || 'Network error occurred while saving.';
      setError(msg);
      toast.error(msg, 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  // Preview logo url to display on card
  const previewLogoUrl = iconMode !== 'vector' ? (logoData || logoUrl || undefined) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                {isEditing ? `Customize Module: ${module?.name}` : 'Register New Platform Module'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Dynamic catalog card configuration &amp; ecosystem routing.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Form + Live Card Preview */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">Module Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. AI Marketing Copilot"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">Badge (Monogram)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={monogram}
                    onChange={(e) => setMonogram(e.target.value.toUpperCase())}
                    placeholder="AI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center uppercase focus:bg-white focus:ring-2 focus:ring-brand outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">Slug Identifier *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="ai-copilot"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 disabled:opacity-60 focus:bg-white focus:ring-2 focus:ring-brand outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">Launch Route / URL *</label>
                  <input
                    type="text"
                    required
                    value={href}
                    onChange={(e) => setHref(e.target.value)}
                    placeholder="/ai/dashboard"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">Category Domain *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand outline-hidden cursor-pointer"
                >
                  {CATEGORY_PRESETS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">Card Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of suite capabilities, POS integrations, and features displayed on Launchpad."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand outline-hidden resize-none"
                />
              </div>

              {/* Module Icon & Branding Section */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Module Icon &amp; Branding Graphic
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Upload image, select preset SVG, or use vector icon
                  </span>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold gap-1 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setIconMode('upload')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[11px] ${
                      iconMode === 'upload' ? 'bg-white text-brand shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('preset')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[11px] ${
                      iconMode === 'preset' ? 'bg-white text-brand shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Ecosystem SVGs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('vector')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[11px] ${
                      iconMode === 'vector' ? 'bg-white text-brand shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Vector Icons</span>
                  </button>
                </div>

                {/* Mode 1: Upload Custom Image / Enter Logo URL */}
                {iconMode === 'upload' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Thumbnail preview */}
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0 p-1">
                        {logoData || logoUrl ? (
                          <img
                            src={logoData || logoUrl || ''}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      {/* File input button & info */}
                      <div className="flex-1 w-full space-y-1">
                        <div className="flex items-center gap-2">
                          <label className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand text-xs font-bold text-slate-700 shadow-2xs cursor-pointer inline-flex items-center gap-1.5 transition-all active:scale-98">
                            <Upload className="w-3.5 h-3.5 text-brand" />
                            <span>Choose Image File...</span>
                            <input
                              type="file"
                              accept="image/png,image/svg+xml,image/jpeg,image/webp"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          {(logoData || logoUrl) && (
                            <button
                              type="button"
                              onClick={() => { setLogoData(null); setLogoUrl(null); setCustomUrl(''); }}
                              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title="Remove custom logo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Supports SVG, PNG, WebP, JPG (Max 5MB). Live preview automatically renders on the card.
                        </p>
                      </div>
                    </div>

                    {/* Or enter direct URL */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Or enter direct image URL / path:</label>
                      <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => {
                          setCustomUrl(e.target.value);
                          setLogoUrl(e.target.value || null);
                          setLogoData(null);
                        }}
                        placeholder="https://... or /module/custom.svg"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Mode 2: Ecosystem SVGs Preset Selector */}
                {iconMode === 'preset' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <p className="text-[10px] font-bold text-slate-500">Pick an official ecosystem graphic:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_MODULE_LOGOS.map((p) => {
                        const isChosen = (logoUrl === p.path) && !logoData;
                        return (
                          <button
                            key={p.path}
                            type="button"
                            onClick={() => {
                              setLogoUrl(p.path);
                              setLogoData(null);
                              setCustomUrl(p.path);
                            }}
                            className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer text-left ${
                              isChosen
                                ? 'bg-white border-brand ring-2 ring-brand/20 shadow-xs'
                                : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5 shrink-0">
                              <img src={p.path} alt={p.label} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 truncate">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mode 3: Semantic Vector Icons */}
                {iconMode === 'vector' && (
                  <div>
                    <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-2xl max-h-28 overflow-y-auto">
                      {Object.entries(ICON_MAP).map(([key, Comp]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setIcon(key);
                            setLogoUrl(null);
                            setLogoData(null);
                          }}
                          title={key}
                          className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            icon === key ? 'bg-brand text-white shadow-xs scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                          }`}
                        >
                          <Comp className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Preset Palette */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5">Color Palette Theme</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setColorTheme(p.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        colorTheme === p.id ? 'border-brand ring-2 ring-brand/20 bg-brand/5 text-brand font-black' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${p.pill.split(' ')[0]}`} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 flex flex-wrap gap-4 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCore}
                    onChange={(e) => setIsCore(e.target.checked)}
                    className="w-4 h-4 text-brand rounded border-slate-300 focus:ring-brand"
                  />
                  <span className="text-xs font-bold text-slate-800">Core Platform Module (Enabled by default)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-brand rounded border-slate-300 focus:ring-brand"
                  />
                  <span className="text-xs font-bold text-slate-800">Active / Visible in Catalog</span>
                </label>
              </div>
            </div>

            {/* Right Column: Live Card Preview (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 space-y-3 sticky top-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Card Preview</span>
                <span className="text-[10px] font-bold text-brand bg-brand-subtle px-2 py-0.5 rounded-full">Launchpad Ready</span>
              </div>
              <ModuleCard
                name={name || 'Sample Module Title'}
                category={category || 'Category Domain'}
                icon={IconComp}
                logoUrl={previewLogoUrl}
                description={description || 'Module card description will appear here on the Launchpad.'}
                cardBg={currentTheme.card}
                size="standard"
                statusDot={isActive}
                isSelected={isActive}
                footerSlot={
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${currentTheme.pill}`}>
                      {monogram || 'MOD'}
                    </span>
                    <span className="text-xs font-extrabold text-brand flex items-center gap-1">
                      Launch Preview &rarr;
                    </span>
                  </div>
                }
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Save Changes' : 'Register Module'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
