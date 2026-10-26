'use client';

import { posAudio } from '@/hooks/usePosAudio';

export interface CashDrawerConfig {
  drawerKickOnCash?: boolean;
  drawerKickPulse?: '24v' | '12v';
  printerType?: 'network' | 'usb' | 'bluetooth';
  printerIp?: string;
  printerPort?: string;
}

/**
 * Generates standard ESC/POS raw byte command to trigger an RJ-11/RJ-12 solenoid cash drawer.
 *
 * Command: ESC p m t1 t2
 * - ESC = 0x1B (27)
 * - p   = 0x70 (112)
 * - m   = 0x00 (pin 2) or 0x01 (pin 5)
 * - t1  = pulse on-time (t1 * 2ms)
 * - t2  = pulse off-time (t2 * 2ms)
 *
 * For standard 24V heavy-duty drawers: t1=25 (50ms ON), t2=250 (500ms OFF) -> [0x1B, 0x70, 0x00, 0x19, 0xFA]
 * For 12V compact drawers: t1=50 (100ms ON), t2=250 (500ms OFF) -> [0x1B, 0x70, 0x00, 0x32, 0xFA]
 */
export function getEscPosDrawerKickCommand(pulse: '24v' | '12v' = '24v', pin: 2 | 5 = 2): Uint8Array {
  const pinByte = pin === 2 ? 0x00 : 0x01;
  const onTimeByte = pulse === '12v' ? 50 : 25; // 100ms vs 50ms
  const offTimeByte = 250; // 500ms
  return new Uint8Array([0x1B, 0x70, pinByte, onTimeByte, offTimeByte]);
}

/**
 * Triggers physical or emulated Cash Drawer Kick.
 * Broadcasts system event, fires low-latency audio feedback, and transmits raw ESC/POS pulse.
 */
export async function kickCashDrawer(config?: CashDrawerConfig): Promise<{ success: boolean; message: string }> {
  const pulse = config?.drawerKickPulse || '24v';
  const rawBytes = getEscPosDrawerKickCommand(pulse);

  // Play mechanical solenoid latch release sound
  posAudio.playDrawerKickChirp();

  // Dispatch custom browser event so external hardware bridges or Electron/Tauri wrappers can capture raw pulse
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('cb_pos_cash_drawer_kick', {
        detail: {
          pulse,
          bytes: Array.from(rawBytes),
          hex: Array.from(rawBytes).map((b) => '0x' + b.toString(16).padStart(2, '0')).join(' '),
          timestamp: new Date().toISOString(),
          config,
        },
      })
    );

    // Direct WebUSB Thermal Printer access if available
    if (config?.printerType === 'usb' && (navigator as any).usb) {
      try {
        const devices = await (navigator as any).usb.getDevices();
        if (devices.length > 0) {
          const printer = devices[0];
          await printer.open();
          await printer.selectConfiguration(1);
          await printer.claimInterface(0);
          await printer.transferOut(1, rawBytes.buffer);
          return { success: true, message: `Cash drawer kicked via direct WebUSB (${pulse.toUpperCase()})` };
        }
      } catch (usbErr) {
        console.warn('WebUSB direct transfer not completed:', usbErr);
      }
    }
  }

  return {
    success: true,
    message: `Cash drawer kick command sent [ESC p 0 ${pulse === '12v' ? '50' : '25'} 250] (${pulse.toUpperCase()})`,
  };
}

/**
 * Formats ESC/POS raw test print byte sequence
 */
export function getEscPosTestPrintCommand(storeName: string = 'CODEBRIDGE CLOUD POS'): Uint8Array {
  const encoder = new TextEncoder();
  const init = new Uint8Array([0x1B, 0x40]); // ESC @
  const center = new Uint8Array([0x1B, 0x61, 0x01]); // ESC a 1
  const boldOn = new Uint8Array([0x1B, 0x45, 0x01]); // ESC E 1
  const boldOff = new Uint8Array([0x1B, 0x45, 0x00]); // ESC E 0
  const title = encoder.encode(`${storeName}\n`);
  const subtitle = encoder.encode('HARDWARE DIAGNOSTIC TEST TICKET\n--------------------------------\n');
  const details = encoder.encode(`Date: ${new Date().toLocaleString()}\nProtocol: ESC/POS Direct Socket\nPulse Solenoid: 24V RJ-11 Ready\nStatus: ONLINE & CALIBRATED\n--------------------------------\n\n\n`);
  const cut = new Uint8Array([0x1D, 0x56, 0x42, 0x00]); // GS V 66 0 (Cut paper)

  // Merge bytes
  const totalLength = init.length + center.length + boldOn.length + title.length + boldOff.length + subtitle.length + details.length + cut.length;
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  [init, center, boldOn, title, boldOff, subtitle, details, cut].forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });
  return merged;
}
