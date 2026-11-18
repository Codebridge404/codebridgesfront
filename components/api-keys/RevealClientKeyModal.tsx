/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0156
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound,
  Copy,
  Check,
  X,
  ShieldCheck,
  Terminal,
  Code2,
} from 'lucide-react';
import { ApiClientItem } from '@/lib/api/apiClients';

interface RevealClientKeyModalProps {
  client: ApiClientItem | null;
  onClose: () => void;
}

export function RevealClientKeyModal({ client, onClose }: RevealClientKeyModalProps) {
  const [copied, setCopied] = useState(false);
  const [snippetTab, setSnippetTab] = useState<'curl' | 'dart' | 'ts'>('curl');

  if (!client) return null;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(client.client_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const curlSnippet = `curl -X GET "https://api.codebridges.io/api/v1/pos-bff/bootstrap?outlet_id=1" \\
  -H "X-App-Key: ${client.client_key}" \\
  -H "Authorization: Bearer <your_access_token>"`;

  const dartSnippet = `final response = await http.get(
  Uri.parse('https://api.codebridges.io/api/v1/pos-bff/bootstrap?outlet_id=1'),
  headers: {
    'X-App-Key': '${client.client_key}',
    'Authorization': 'Bearer \$accessToken',
    'Accept': 'application/json',
  },
);`;

  const tsSnippet = `import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.codebridges.io/api/v1',
  headers: {
    'X-App-Key': '${client.client_key}',
    'Authorization': \`Bearer \${accessToken}\`,
  },
});`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 space-y-5 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Client Credentials Issued</h3>
              <p className="text-xs text-slate-400 font-medium">{client.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">
              Public App Key (`X-App-Key`)
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={client.client_key}
                className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-900 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-slate-400">
                Integration Code Snippets
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSnippetTab('curl')}
                  className={`px-2 py-0.5 rounded-md ${snippetTab === 'curl' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
                >
                  cURL
                </button>
                <button
                  type="button"
                  onClick={() => setSnippetTab('dart')}
                  className={`px-2 py-0.5 rounded-md ${snippetTab === 'dart' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
                >
                  Flutter / Dart
                </button>
                <button
                  type="button"
                  onClick={() => setSnippetTab('ts')}
                  className={`px-2 py-0.5 rounded-md ${snippetTab === 'ts' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
                >
                  TypeScript
                </button>
              </div>
            </div>

            <pre className="font-mono text-[11px] text-slate-800 bg-slate-900 text-slate-100 p-3.5 rounded-2xl overflow-x-auto max-h-44 leading-relaxed">
              {snippetTab === 'curl' ? curlSnippet : snippetTab === 'dart' ? dartSnippet : tsSnippet}
            </pre>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

