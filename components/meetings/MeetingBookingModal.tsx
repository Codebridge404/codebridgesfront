'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CalendarClock,
  DoorOpen,
  Users,
  Video,
  AlertCircle,
  CheckCircle2,
  Package,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  ShieldAlert,
  Sparkles,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  getMeetingRoomsApi,
  createMeetingApi,
  getMaterialsApi,
  getStaffApi,
  getMeetingSystemSettingsApi,
  previewRecurringApi,
  MeetingRoomItem,
  MaterialItem,
  StaffItem,
  RecurringPreviewItem,
} from '@/lib/api/meetings';
import { useToast } from '@/components/common';

interface MeetingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialRoomId?: number;
  initialDate?: string;
  initialStartTime?: string;
}

const STEPS = [
  { num: 1, label: 'Basics' },
  { num: 2, label: 'Schedule' },
  { num: 3, label: 'Room' },
  { num: 4, label: 'Logistics' },
  { num: 5, label: 'Staff' },
  { num: 6, label: 'Review' },
];

export function MeetingBookingModal({
  isOpen,
  onClose,
  onSuccess,
  initialRoomId,
  initialDate,
  initialStartTime,
}: MeetingBookingModalProps) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  // Dynamic system settings
  const [settings, setSettings] = useState<Record<string, any>>({
    'booking.operating_hours_start': '08:00',
    'booking.operating_hours_end': '19:00',
    'booking.allow_weekend_booking': false,
    'booking.approval_threshold_capacity': 20,
    'booking.buffer_minutes': 15,
  });

  // Resources
  const [rooms, setRooms] = useState<MeetingRoomItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_type: 'internal' as 'internal' | 'client' | 'review' | 'training',
    meeting_link: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    start_hour: initialStartTime || '09:00',
    end_hour: initialStartTime
      ? `${String(parseInt(initialStartTime.split(':')[0], 10) + 1).padStart(2, '0')}:00`
      : '10:00',
    room_id: initialRoomId ? String(initialRoomId) : '',
    recurrence_type: 'none',
    occurrences_count: 4,
  });

  // Allocations
  const [selectedMaterials, setSelectedMaterials] = useState<Record<number, number>>({});
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [attendees, setAttendees] = useState<Array<{ name: string; email: string; role: string }>>([]);
  const [newAttendee, setNewAttendee] = useState({ name: '', email: '', role: 'attendee' });

  // Recurring preview state
  const [previewingRecurring, setPreviewingRecurring] = useState(false);
  const [recurringPreviews, setRecurringPreviews] = useState<RecurringPreviewItem[]>([]);
  const [recurringConflictsCount, setRecurringConflictsCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setConflictError(null);
      setRecurringPreviews([]);
      loadInitialData();
      setFormData((prev) => ({
        ...prev,
        room_id: initialRoomId ? String(initialRoomId) : prev.room_id,
        date: initialDate || prev.date,
        start_hour: initialStartTime || prev.start_hour,
        end_hour: initialStartTime
          ? `${String(parseInt(initialStartTime.split(':')[0], 10) + 1).padStart(2, '0')}:00`
          : prev.end_hour,
      }));
    }
  }, [isOpen, initialRoomId, initialDate, initialStartTime]);

  const loadInitialData = async () => {
    setLoadingResources(true);
    try {
      const [roomsRes, materialsRes, staffRes, settingsRes] = await Promise.allSettled([
        getMeetingRoomsApi(),
        getMaterialsApi(),
        getStaffApi(),
        getMeetingSystemSettingsApi(),
      ]);

      if (roomsRes.status === 'fulfilled') {
        const r = roomsRes.value?.data || roomsRes.value;
        const list = Array.isArray(r) ? r : [];
        setRooms(list);
        if (!formData.room_id && list.length > 0) {
          setFormData((prev) => ({ ...prev, room_id: String(list[0].id) }));
        }
      }

      if (materialsRes.status === 'fulfilled' && materialsRes.value?.data) {
        setMaterials(materialsRes.value.data);
      }

      if (staffRes.status === 'fulfilled' && staffRes.value?.data) {
        setStaffList(staffRes.value.data);
      }

      if (settingsRes.status === 'fulfilled' && settingsRes.value?.data) {
        setSettings((prev) => ({ ...prev, ...settingsRes.value.data }));
      }
    } catch {
      toast.error('Failed to load conference resources.');
    } finally {
      setLoadingResources(false);
    }
  };

  if (!isOpen) return null;

  const selectedRoom = rooms.find((r) => String(r.id) === String(formData.room_id));
  const approvalThreshold = Number(settings['booking.approval_threshold_capacity'] || 20);
  const requiresApproval = selectedRoom ? selectedRoom.capacity >= approvalThreshold : false;

  // Validation per step
  const isWeekendSelected = () => {
    if (!formData.date) return false;
    const day = new Date(formData.date).getDay();
    return day === 0 || day === 6;
  };

  const handleNext = async () => {
    setConflictError(null);
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast.error('Please enter a meeting title.');
        return;
      }
    } else if (currentStep === 2) {
      if (formData.start_hour >= formData.end_hour) {
        toast.error('End time must be after start time.');
        return;
      }
      if (!settings['booking.allow_weekend_booking'] && isWeekendSelected()) {
        toast.error('Weekend bookings are restricted by workspace policy.');
        return;
      }
      // If recurring, run preview
      if (formData.recurrence_type !== 'none' && formData.room_id) {
        await handleRunRecurringPreview();
      }
    } else if (currentStep === 3) {
      if (!formData.room_id) {
        toast.error('Please choose a conference room.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRunRecurringPreview = async () => {
    if (!formData.room_id || formData.recurrence_type === 'none') return;
    setPreviewingRecurring(true);
    try {
      const res = await previewRecurringApi({
        room_id: Number(formData.room_id),
        start_time: `${formData.date} ${formData.start_hour}:00`,
        end_time: `${formData.date} ${formData.end_hour}:00`,
        recurrence_type: formData.recurrence_type,
        occurrences_count: formData.occurrences_count,
      });

      if (res?.data) {
        setRecurringPreviews(res.data.occurrences || []);
        setRecurringConflictsCount(res.data.conflicts_count || 0);
      }
    } catch {
      // preview error
    } finally {
      setPreviewingRecurring(false);
    }
  };

  const handleAddAttendee = () => {
    if (!newAttendee.name.trim() && !newAttendee.email.trim()) return;
    setAttendees([...attendees, { ...newAttendee }]);
    setNewAttendee({ name: '', email: '', role: 'attendee' });
  };

  const handleRemoveAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setConflictError(null);
    setSubmitting(true);
    try {
      const startDateTime = `${formData.date} ${formData.start_hour}:00`;
      const endDateTime = `${formData.date} ${formData.end_hour}:00`;

      // Material allocations
      const materialAllocations = Object.entries(selectedMaterials)
        .filter(([_, qty]) => qty > 0)
        .map(([id, quantity]) => ({
          material_id: Number(id),
          quantity,
        }));

      // Staff allocations
      const staffAllocations = selectedStaff.map((id) => ({
        staff_id: id,
      }));

      const payload = {
        room_id: Number(formData.room_id),
        title: formData.title,
        description: formData.description || undefined,
        start_time: startDateTime,
        end_time: endDateTime,
        meeting_type: formData.meeting_type,
        meeting_link: formData.meeting_link || undefined,
        recurrence_type: formData.recurrence_type as any,
        occurrences_count: formData.recurrence_type !== 'none' ? formData.occurrences_count : undefined,
        attendees,
        materials: materialAllocations,
        support_staff: staffAllocations,
      };

      const res = await createMeetingApi(payload);
      if (res?.status === 'success' || res?.data) {
        const msg = requiresApproval
          ? `Meeting submitted for Boardroom Approval (${selectedRoom?.capacity} seats threshold)`
          : `Meeting "${formData.title}" booked successfully!`;
        toast.success(msg);
        onSuccess?.();
        onClose();
      } else {
        throw new Error(res?.message || 'Conflict detected or booking failed.');
      }
    } catch (err: any) {
      setConflictError(err.message || 'Scheduling conflict or validation error.');
      toast.error(err.message || 'Booking conflict detected.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[92vh] rounded-3xl bg-white border border-slate-200/90 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Wizard Header & Stepper */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Conference Booking Wizard
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Zero-Conflict Reservation &amp; Logistics Dispatch
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Bar */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {STEPS.map((s) => {
              const isPast = s.num < currentStep;
              const isCurrent = s.num === currentStep;
              return (
                <div
                  key={s.num}
                  className={`flex-1 flex items-center gap-1.5 py-1 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                      : isPast
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isCurrent
                        ? 'bg-white/20 text-white'
                        : isPast
                        ? 'bg-emerald-200 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline truncate">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs font-medium text-slate-700">
          {conflictError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Collision Alert</p>
                <p className="text-[11px]">{conflictError}</p>
              </div>
            </div>
          )}

          {/* STEP 1: BASICS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Meeting Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Q4 Executive Strategy & Financial Alignment"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Meeting Classification</label>
                  <select
                    value={formData.meeting_type}
                    onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  >
                    <option value="internal">Internal Team Sync</option>
                    <option value="client">Client &amp; Stakeholder Pitch</option>
                    <option value="review">Board / Strategy Review</option>
                    <option value="training">Workshop &amp; Training</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Virtual Bridge Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    placeholder="https://zoom.us/j/... or Google Meet"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Agenda &amp; Scope Objectives</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key discussion milestones, required materials, and outcomes..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: SCHEDULE & RECURRENCE */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Workspace Operating Hours Policy</p>
                  <p className="text-[11px] text-indigo-700">
                    Official conference hours: {settings['booking.operating_hours_start']} - {settings['booking.operating_hours_end']}.
                    {!settings['booking.allow_weekend_booking'] && ' Weekend reservations are restricted.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                  {isWeekendSelected() && !settings['booking.allow_weekend_booking'] && (
                    <p className="text-[10px] text-rose-600 font-bold">Selected day is a weekend (Blocked).</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_hour}
                    onChange={(e) => setFormData({ ...formData, start_hour: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_hour}
                    onChange={(e) => setFormData({ ...formData, end_hour: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Recurrence Rule */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Recurring Cadence
                  </label>
                  {formData.recurrence_type !== 'none' && (
                    <button
                      type="button"
                      onClick={handleRunRecurringPreview}
                      disabled={previewingRecurring || !formData.room_id}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                    >
                      {previewingRecurring ? 'Testing Conflicts...' : 'Test Recurrence Conflicts'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['none', 'daily', 'weekly', 'bi_weekly', 'monthly'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, recurrence_type: type })}
                      className={`p-2 rounded-xl border text-center text-xs font-bold capitalize transition-all ${
                        formData.recurrence_type === type
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {formData.recurrence_type !== 'none' && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs font-semibold text-slate-600">Total Occurrences:</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={formData.occurrences_count}
                      onChange={(e) => setFormData({ ...formData, occurrences_count: Number(e.target.value) })}
                      className="w-20 p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-center"
                    />
                    <span className="text-[11px] text-slate-400">sessions in series</span>
                  </div>
                )}

                {/* Pre-flight conflict results */}
                {recurringPreviews.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">Pre-Flight Conflict Preview:</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        recurringConflictsCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {recurringConflictsCount > 0 ? `${recurringConflictsCount} Collision Detected` : 'All Occurrences Free'}
                      </span>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                      {recurringPreviews.map((p) => (
                        <div
                          key={p.index}
                          className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] ${
                            p.has_conflict ? 'bg-rose-50 text-rose-900 border border-rose-200' : 'bg-white text-slate-700 border border-slate-100'
                          }`}
                        >
                          <span>Session #{p.index}: {p.date}</span>
                          <span className="font-semibold">
                            {p.has_conflict ? `Collision: "${p.conflict?.title}"` : 'Clear ✓'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: ROOM SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Select Conference Room</span>
                <span className="text-[11px] text-slate-400">Filtered by availability</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {rooms.map((room) => {
                  const isSelected = String(room.id) === String(formData.room_id);
                  const isBoardroom = room.capacity >= approvalThreshold;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setFormData({ ...formData, room_id: String(room.id) })}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-2xs'
                          : 'border-slate-200/90 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{room.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {room.floor || 'Main Facility'} • Up to {room.capacity} Seats
                          </p>
                        </div>
                        {isBoardroom && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 shrink-0">
                            Boardroom Gate
                          </span>
                        )}
                      </div>
                      {room.amenities && (
                        <p className="text-[10px] text-slate-400 mt-2 truncate">
                          Equipped: {room.amenities}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: EQUIPMENT & LOGISTICS */}
          {currentStep === 4 && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Logistics Inventory</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">Atomic Auto-Restock Guarantee</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {materials.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">No logistics equipment found in inventory.</p>
                ) : (
                  materials.map((mat) => {
                    const currentQty = selectedMaterials[mat.id] || 0;
                    return (
                      <div
                        key={mat.id}
                        className="p-3 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{mat.name}</p>
                          <p className="text-[10px] text-slate-400">
                            SKU: {mat.sku} • Stock: {mat.available_quantity} {mat.unit}s available
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMaterials({
                                ...selectedMaterials,
                                [mat.id]: Math.max(0, currentQty - 1),
                              })
                            }
                            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-xs">{currentQty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMaterials({
                                ...selectedMaterials,
                                [mat.id]: Math.min(mat.available_quantity, currentQty + 1),
                              })
                            }
                            disabled={currentQty >= mat.available_quantity}
                            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-600 cursor-pointer disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 5: SUPPORT STAFF */}
          {currentStep === 5 && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Certified Support Specialists</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">On-Duty Technicians</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {staffList.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">No support specialists registered.</p>
                ) : (
                  staffList.map((st) => {
                    const isSelected = selectedStaff.includes(st.id);
                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedStaff(selectedStaff.filter((id) => id !== st.id));
                          } else {
                            setSelectedStaff([...selectedStaff, st.id]);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/60 border-indigo-400 text-indigo-950 font-bold'
                            : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{st.name}</p>
                          <p className="text-[10px] text-slate-500">
                            Role: {st.role} • {st.phone || st.email}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 6: ATTENDEES & REVIEW CONFIRMATION */}
          {currentStep === 6 && (
            <div className="space-y-4">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">{formData.title}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">
                    {formData.meeting_type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <p><strong>Room:</strong> {selectedRoom?.name || 'Selected Room'}</p>
                  <p><strong>Date:</strong> {formData.date}</p>
                  <p><strong>Time:</strong> {formData.start_hour} - {formData.end_hour}</p>
                  <p><strong>Recurrence:</strong> {formData.recurrence_type}</p>
                </div>
                {requiresApproval && (
                  <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 flex items-center gap-2 text-[11px]">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Room capacity ({selectedRoom?.capacity}) meets or exceeds the threshold ({approvalThreshold}). This session will require Boardroom approval.
                    </span>
                  </div>
                )}
              </div>

              {/* Add Attendees List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800">Add Attendees &amp; Guests</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAttendee.name}
                    onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                    placeholder="Full name"
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <input
                    type="email"
                    value={newAttendee.email}
                    onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                    placeholder="Email address"
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttendee}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {attendees.map((att, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span>{att.name} ({att.email || 'No email'})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(i)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all ${
                  requiresApproval
                    ? 'bg-gradient-to-r from-amber-600 to-indigo-600 hover:opacity-95'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {submitting ? (
                  <span>Processing Reservation...</span>
                ) : requiresApproval ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Submit for Boardroom Approval</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Reserve Room</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
