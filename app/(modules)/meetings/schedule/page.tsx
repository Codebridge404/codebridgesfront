'use client';

import React, { useState } from 'react';
import { MeetingScheduleGrid } from '@/components/meetings/MeetingScheduleGrid';
import { MeetingBookingModal } from '@/components/meetings/MeetingBookingModal';

export default function MeetingSchedulePage() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [prefilledRoomId, setPrefilledRoomId] = useState<number | undefined>();
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>();
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>();

  const handleSelectSlot = (roomId: number, dateStr: string, timeStr: string) => {
    setPrefilledRoomId(roomId);
    setPrefilledDate(dateStr);
    setPrefilledTime(timeStr);
    setBookingModalOpen(true);
  };

  return (
    <>
      <MeetingScheduleGrid onSelectSlot={handleSelectSlot} />
      <MeetingBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialRoomId={prefilledRoomId}
        initialDate={prefilledDate}
        initialStartTime={prefilledTime}
        onSuccess={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
      />
    </>
  );
}
