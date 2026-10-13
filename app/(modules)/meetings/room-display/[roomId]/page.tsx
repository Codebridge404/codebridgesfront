'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RoomDoorDisplayView } from '@/components/meetings/RoomDoorDisplayView';

export default function RoomDisplayPage() {
  const params = useParams();
  const rawId = params?.roomId;
  const roomId = rawId ? parseInt(String(rawId), 10) : 1;

  return <RoomDoorDisplayView roomId={roomId} />;
}
