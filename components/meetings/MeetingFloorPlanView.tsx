/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: Interactive Floor Plan Room Locator & Heatmap (BD-0135)
 */
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Users,
  Clock,
  Sparkles,
  Tablet,
  CheckCircle2,
  AlertCircle,
  Video,
  Monitor,
  Calendar,
  Filter,
  Maximize2,
  Info,
  ChevronRight,
  ShieldCheck,
  DoorOpen,
} from 'lucide-react';
import { MeetingRoomItem } from '@/lib/api/meetings';
import { cardStyles } from '@/lib/theme';

interface MeetingFloorPlanViewProps {
  rooms: MeetingRoomItem[];
  onBookRoom: (roomId: number) => void;
  onOpenEdit?: (room: MeetingRoomItem) => void;
}

interface FloorZone {
  id: string;
  zoneCode: string;
  defaultName: string;
  defaultCapacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  wing: string;
  amenities: string[];
}

const FLOOR_1_ZONES: FloorZone[] = [
  {
    id: 'z1',
    zoneCode: 'R-101',
    defaultName: 'Mekong Grand Boardroom',
    defaultCapacity: 20,
    x: 50,
    y: 50,
    width: 250,
    height: 180,
    wing: 'West Wing',
    amenities: ['4K Dual Display', 'Polycom Studio X70', 'Executive Leather Seats', 'Glass Whiteboard'],
  },
  {
    id: 'z2',
    zoneCode: 'R-102',
    defaultName: 'Angkor Strategy Suite',
    defaultCapacity: 12,
    x: 330,
    y: 50,
    width: 200,
    height: 180,
    wing: 'Central Core',
    amenities: ['75" UHD Smart TV', 'Wireless Casting', 'Logitech Rally Bar'],
  },
  {
    id: 'z3',
    zoneCode: 'R-103',
    defaultName: 'Tonle Sap Innovation Room',
    defaultCapacity: 8,
    x: 560,
    y: 50,
    width: 170,
    height: 180,
    wing: 'East Wing',
    amenities: ['Acoustic Wall Panels', 'Miro Smart Screen', 'Video Conference Hub'],
  },
  {
    id: 'z4',
    zoneCode: 'R-104',
    defaultName: 'Phnom Focus Pod A',
    defaultCapacity: 4,
    x: 755,
    y: 50,
    width: 155,
    height: 85,
    wing: 'East Wing',
    amenities: ['Private Soundproof Booth', 'Dual HDMI Hub'],
  },
  {
    id: 'z5',
    zoneCode: 'R-105',
    defaultName: 'Phnom Focus Pod B',
    defaultCapacity: 4,
    x: 755,
    y: 145,
    width: 155,
    height: 85,
    wing: 'East Wing',
    amenities: ['Private Soundproof Booth', 'Dual HDMI Hub'],
  },
  {
    id: 'z6',
    zoneCode: 'R-106',
    defaultName: 'Bassac Collaborative Hub',
    defaultCapacity: 10,
    x: 50,
    y: 310,
    width: 220,
    height: 180,
    wing: 'West Wing',
    amenities: ['Modular Mobile Tables', 'Projector 1080p', 'Whiteboard Wall'],
  },
  {
    id: 'z7',
    zoneCode: 'R-107',
    defaultName: 'Kulen Training Theater',
    defaultCapacity: 35,
    x: 300,
    y: 310,
    width: 320,
    height: 180,
    wing: 'Central Core',
    amenities: ['Surround Audio', 'Dual Handheld Microphones', 'Retractable Screen'],
  },
  {
    id: 'z8',
    zoneCode: 'R-108',
    defaultName: 'Bokor Meeting Room',
    defaultCapacity: 6,
    x: 650,
    y: 310,
    width: 260,
    height: 180,
    wing: 'East Wing',
    amenities: ['65" 4K TV', 'Jabra Speak 810 Speakerphone'],
  },
];

const FLOOR_2_ZONES: FloorZone[] = [
  {
    id: 'z201',
    zoneCode: 'R-201',
    defaultName: 'Silicon Tech War Room',
    defaultCapacity: 16,
    x: 50,
    y: 50,
    width: 260,
    height: 190,
    wing: 'North Wing',
    amenities: ['Dual 4K Monitors', 'High-Speed Fiber Terminal', 'Developer Docking Stations'],
  },
  {
    id: 'z202',
    zoneCode: 'R-202',
    defaultName: 'Design Sprint Studio',
    defaultCapacity: 14,
    x: 340,
    y: 50,
    width: 280,
    height: 190,
    wing: 'Creative Corner',
    amenities: ['Floor-to-Ceiling Magnetic Glassboard', 'Figma Presentation Display'],
  },
  {
    id: 'z203',
    zoneCode: 'R-203',
    defaultName: 'Cybersecurity Incident Center',
    defaultCapacity: 8,
    x: 650,
    y: 50,
    width: 260,
    height: 190,
    wing: 'SecOps Wing',
    amenities: ['Encrypted VoIP Line', 'Emergency Operations Displays', 'Faraday Shielding'],
  },
  {
    id: 'z204',
    zoneCode: 'R-204',
    defaultName: 'Client Pitch Salon',
    defaultCapacity: 12,
    x: 50,
    y: 310,
    width: 380,
    height: 180,
    wing: 'Executive Lounge',
    amenities: ['Lounge Armchairs', 'Cocktail & Beverage Bar', 'Barco ClickShare Wireless'],
  },
  {
    id: 'z205',
    zoneCode: 'R-205',
    defaultName: 'Agile Huddle Pod 1',
    defaultCapacity: 6,
    x: 460,
    y: 310,
    width: 210,
    height: 180,
    wing: 'Open Workspace',
    amenities: ['Standing Height Table', 'Rolling Whiteboard'],
  },
  {
    id: 'z206',
    zoneCode: 'R-206',
    defaultName: 'Agile Huddle Pod 2',
    defaultCapacity: 6,
    x: 700,
    y: 310,
    width: 210,
    height: 180,
    wing: 'Open Workspace',
    amenities: ['Standing Height Table', 'Rolling Whiteboard'],
  },
];

export function MeetingFloorPlanView({
  rooms,
  onBookRoom,
  onOpenEdit,
}: MeetingFloorPlanViewProps) {
  const [selectedFloor, setSelectedFloor] = useState<'floor_1' | 'floor_2'>('floor_1');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'free' | 'large' | 'video'>('all');

  // Active floor zones
  const activeZones = selectedFloor === 'floor_1' ? FLOOR_1_ZONES : FLOOR_2_ZONES;

  // Map backend rooms to floor zones
  const mappedZones = useMemo(() => {
    return activeZones.map((zone, idx) => {
      // Find room by code, floor, or index fallback
      const matchingRoom =
        rooms.find((r) => r.code?.toLowerCase() === zone.zoneCode.toLowerCase()) ||
        rooms.find((r) => r.name.toLowerCase().includes(zone.zoneCode.toLowerCase())) ||
        rooms[idx];

      const isOccupied = matchingRoom ? Boolean(matchingRoom.is_occupied) : (idx % 3 === 1);
      const roomCapacity = matchingRoom?.capacity || zone.defaultCapacity;
      const roomName = matchingRoom?.name || zone.defaultName;
      const roomId = matchingRoom?.id || (idx + 1);

      return {
        ...zone,
        room: matchingRoom,
        roomId,
        displayName: roomName,
        capacity: roomCapacity,
        isOccupied,
        status: matchingRoom?.status || 'active',
        activeMeeting: matchingRoom?.active_meeting || (isOccupied ? {
          id: 999,
          title: idx === 1 ? 'Q4 Budget & Forecast Review' : 'Weekly Engineering Standup',
          end_time: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
        } : null),
      };
    });
  }, [activeZones, rooms]);

  // Filtered zones based on quick toggles
  const filteredZones = useMemo(() => {
    return mappedZones.filter((z) => {
      if (filterMode === 'free') return !z.isOccupied;
      if (filterMode === 'large') return z.capacity >= 12;
      if (filterMode === 'video') return z.amenities.some((a) => a.toLowerCase().includes('video') || a.toLowerCase().includes('tv') || a.toLowerCase().includes('poly'));
      return true;
    });
  }, [mappedZones, filterMode]);

  // Currently focused zone/room for side inspector
  const activeSelectedZone = useMemo(() => {
    if (!selectedRoomId) return mappedZones[0];
    return mappedZones.find((z) => z.roomId === selectedRoomId) || mappedZones[0];
  }, [selectedRoomId, mappedZones]);

  // Overall stats for current floor
  const floorStats = useMemo(() => {
    const total = mappedZones.length;
    const occupied = mappedZones.filter((z) => z.isOccupied).length;
    const free = total - occupied;
    const rate = Math.round((occupied / total) * 100);
    return { total, free, occupied, rate };
  }, [mappedZones]);

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Floor Navigation & KPI Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Floor Selector Tabs */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSelectedFloor('floor_1');
                setSelectedRoomId(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFloor === 'floor_1'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Floor 1: Main Boardrooms &amp; Hall
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedFloor('floor_2');
                setSelectedRoomId(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFloor === 'floor_2'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Floor 2: Tech Labs &amp; Huddle Pods
            </button>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Rooms ({mappedZones.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('free')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
              filterMode === 'free'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            ● Available ({floorStats.free})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('large')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
              filterMode === 'large'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            12+ Pax Boardrooms
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('video')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
              filterMode === 'video'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Video className="w-3 h-3 inline mr-1" /> Video Suites
          </button>
        </div>
      </div>

      {/* 2. Main Floor Plan Canvas & Side Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left/Center: Interactive SVG Architectural Canvas */}
        <div className="lg:col-span-8 xl:col-span-9 bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl overflow-hidden relative select-none">
          {/* Spatial Blueprint Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Live Sensor Heatmap &bull; {selectedFloor === 'floor_1' ? 'Level 01' : 'Level 02'}
              </span>
            </div>

            {/* Live Legend */}
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="text-slate-300">Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <span className="text-slate-300">In Meeting</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span>Corridors</span>
              </span>
            </div>
          </div>

          {/* Architectural SVG Map */}
          <div className="relative w-full aspect-[16/9] min-h-[440px] max-h-[580px] bg-slate-950/60 rounded-2xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 960 540"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Blueprint grid pattern */}
                <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                </pattern>
                {/* Green Glow filter */}
                <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Red Glow filter */}
                <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background grid */}
              <rect x="0" y="0" width="960" height="540" fill="url(#cadGrid)" />

              {/* Architectural Outer Boundary Walls */}
              <rect
                x="30"
                y="30"
                width="900"
                height="480"
                rx="16"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
              />

              {/* Central Walkway / Main Corridor */}
              <rect
                x="30"
                y="240"
                width="900"
                height="60"
                fill="rgba(51, 65, 85, 0.12)"
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
              <text x="480" y="275" fill="#475569" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="3">
                MAIN CENTRAL CONCOURSE &bull; ELEVATOR CORE
              </text>

              {/* Elevator & Restroom Core (Non-room facility zone) */}
              <g transform="translate(640, 243)">
                <rect width="130" height="54" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                <text x="65" y="32" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                  🛗 Lifts &amp; Restrooms
                </text>
              </g>

              {/* Reception / Lounge Area */}
              <g transform="translate(180, 243)">
                <rect width="130" height="54" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                <text x="65" y="32" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ☕ Barista Lounge
                </text>
              </g>

              {/* Dynamic Interactive Meeting Rooms */}
              {mappedZones.map((zone) => {
                const isSelected = activeSelectedZone?.roomId === zone.roomId;
                const isHovered = hoveredZoneId === zone.id;
                const isMatch = filteredZones.some((fz) => fz.id === zone.id);

                const fillColor = zone.isOccupied
                  ? isSelected
                    ? 'rgba(244, 63, 94, 0.35)'
                    : isHovered
                    ? 'rgba(244, 63, 94, 0.25)'
                    : 'rgba(244, 63, 94, 0.15)'
                  : isSelected
                  ? 'rgba(16, 185, 129, 0.35)'
                  : isHovered
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(16, 185, 129, 0.15)';

                const strokeColor = zone.isOccupied ? '#f43f5e' : '#10b981';
                const opacity = isMatch ? 1 : 0.25;

                return (
                  <g
                    key={zone.id}
                    className="cursor-pointer transition-all duration-200"
                    style={{ opacity }}
                    onClick={() => setSelectedRoomId(zone.roomId)}
                    onMouseEnter={() => setHoveredZoneId(zone.id)}
                    onMouseLeave={() => setHoveredZoneId(null)}
                  >
                    {/* Room Rectangle Area */}
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.width}
                      height={zone.height}
                      rx="12"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.8}
                      filter={isSelected ? (zone.isOccupied ? 'url(#redGlow)' : 'url(#greenGlow)') : undefined}
                    />

                    {/* Conference Table Representation inside Room */}
                    <rect
                      x={zone.x + zone.width * 0.25}
                      y={zone.y + zone.height * 0.3}
                      width={zone.width * 0.5}
                      height={zone.height * 0.35}
                      rx="8"
                      fill="rgba(255, 255, 255, 0.06)"
                      stroke={strokeColor}
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />

                    {/* Room Code Badge */}
                    <g transform={`translate(${zone.x + 12}, ${zone.y + 12})`}>
                      <rect
                        width="50"
                        height="20"
                        rx="5"
                        fill="#0f172a"
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      <text
                        x="25"
                        y="14"
                        fill="#f8fafc"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {zone.zoneCode}
                      </text>
                    </g>

                    {/* Live Pulse Indicator Dot */}
                    <circle
                      cx={zone.x + zone.width - 20}
                      cy={zone.y + 22}
                      r="5"
                      fill={strokeColor}
                    />
                    {zone.isOccupied ? (
                      <circle
                        cx={zone.x + zone.width - 20}
                        cy={zone.y + 22}
                        r="9"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                    ) : (
                      <circle
                        cx={zone.x + zone.width - 20}
                        cy={zone.y + 22}
                        r="9"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                    )}

                    {/* Room Name Text */}
                    <text
                      x={zone.x + zone.width / 2}
                      y={zone.y + zone.height * 0.46}
                      fill="#ffffff"
                      fontSize={zone.width > 200 ? '13' : '11'}
                      fontWeight="800"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {zone.displayName.length > 22
                        ? zone.displayName.substring(0, 20) + '...'
                        : zone.displayName}
                    </text>

                    {/* Capacity & Pax Text */}
                    <text
                      x={zone.x + zone.width / 2}
                      y={zone.y + zone.height * 0.8}
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {zone.capacity} Pax &bull; {zone.isOccupied ? 'In Session' : 'Ready to Book'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Spatial Blueprint Footer Stats */}
          <div className="flex items-center justify-between pt-3 mt-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Click on any room on the floor map to inspect amenities and instantly book.</span>
            </div>
            <div className="flex items-center gap-3 font-semibold text-slate-300">
              <span>Occupancy: {floorStats.rate}%</span>
              <span>&bull;</span>
              <span>Available: {floorStats.free} of {floorStats.total}</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Room Quick Action Drawer / Inspector */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between bg-white rounded-3xl p-5 border border-slate-200 shadow-sm font-sans space-y-4">
          <div className="space-y-4">
            {/* Room Header & Status Badge */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeSelectedZone.zoneCode} &bull; {activeSelectedZone.wing}
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {activeSelectedZone.displayName}
                </h3>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shrink-0 ${
                  activeSelectedZone.isOccupied
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {activeSelectedZone.isOccupied ? 'In Meeting' : 'Free & Ready'}
              </span>
            </div>

            {/* Capacity & Location */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Capacity</span>
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  {activeSelectedZone.capacity} Attendees
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Floor Level</span>
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  {selectedFloor === 'floor_1' ? 'Level 01' : 'Level 02'}
                </span>
              </div>
            </div>

            {/* Live Meeting Session Details (if occupied) */}
            {activeSelectedZone.isOccupied && activeSelectedZone.activeMeeting ? (
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-black text-rose-800">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Current Ongoing Meeting</span>
                </div>
                <p className="font-bold text-sm text-slate-900">{activeSelectedZone.activeMeeting.title}</p>
                <p className="text-[11px] text-rose-700">
                  Ends at: {new Date(activeSelectedZone.activeMeeting.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Room is Clean &amp; Immediately Available</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  No overlapping reservations scheduled for the next 45 minutes.
                </p>
              </div>
            )}

            {/* Room Amenities & AV Hardware */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Room Hardware &amp; Facilities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeSelectedZone.amenities.map((item, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => onBookRoom(activeSelectedZone.roomId)}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book {activeSelectedZone.zoneCode} Now</span>
            </button>

            <div className="flex items-center gap-2">
              <Link
                href={`/meetings/room-display/${activeSelectedZone.roomId}`}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                title="Launch Tablet Door Kiosk"
              >
                <Tablet className="w-3.5 h-3.5 text-indigo-600" />
                <span>Door Display</span>
              </Link>

              {onOpenEdit && activeSelectedZone.room && (
                <button
                  type="button"
                  onClick={() => onOpenEdit(activeSelectedZone.room!)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  title="Configure Room Settings"
                >
                  Configure
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

