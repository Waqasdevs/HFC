'use client';

import React, { useState, useEffect } from 'react';
import type { RestaurantSettings } from '@/types';
import { 
  Settings, 
  Store, 
  Database, 
  Printer, 
  Volume2, 
  Save, 
  CheckCircle2, 
  X,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { sound } from '@/lib/sound';
import { cleanSupabaseUrl } from '@/lib/sync';
import { SUPABASE_SCHEMA_SQL } from '@/lib/schemaSql';
import { createClient } from '@supabase/supabase-js';

interface RestaurantSettingsModalProps {
  settings: RestaurantSettings;
  onSaveSettings: (settings: RestaurantSettings) => void;
  onClose?: () => void;
}

export const RestaurantSettingsModal: React.FC<RestaurantSettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [formData, setFormData] = useState<RestaurantSettings>(() => {
    const envKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
    const currentKey = settings.supabaseAnonKey?.trim() || '';
    const initialKey = (currentKey.startsWith('sb_publishable_') && envKey.startsWith('eyJ'))
      ? envKey
      : (currentKey || envKey);

    const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const currentUrl = settings.supabaseUrl?.trim() || '';
    const initialUrl = cleanSupabaseUrl(currentUrl || envUrl);

    return {
      ...settings,
      supabaseUrl: initialUrl,
      supabaseAnonKey: initialKey,
    };
  });

  useEffect(() => {
    const envKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
    const currentKey = settings.supabaseAnonKey?.trim() || '';
    const initialKey = (currentKey.startsWith('sb_publishable_') && envKey.startsWith('eyJ'))
      ? envKey
      : (currentKey || envKey);

    const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const currentUrl = settings.supabaseUrl?.trim() || '';
    const initialUrl = cleanSupabaseUrl(currentUrl || envUrl);

    setFormData(prev => ({
      ...settings,
      supabaseUrl: initialUrl || prev.supabaseUrl,
      supabaseAnonKey: initialKey || prev.supabaseAnonKey,
    }));
  }, [settings]);

  const [isSaved, setIsSaved] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showAdvancedCloud, setShowAdvancedCloud] = useState(() => {
    return !(settings.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL);
  });
  const [copiedSql, setCopiedSql] = useState(false);

  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleApplyVercelCredentials = () => {
    sound.playTap();
    const envUrl = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const envKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
    if (envUrl || envKey) {
      setFormData(prev => ({
        ...prev,
        supabaseUrl: envUrl || prev.supabaseUrl,
        supabaseAnonKey: envKey || prev.supabaseAnonKey,
      }));
      setTestResult('Loaded URL and Anon Key from Vercel config! Click "Save Settings" or "Test Cloud Connection".');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const cleanUrl = cleanSupabaseUrl(formData.supabaseUrl);
    const cleanKey = (formData.supabaseAnonKey || '').trim();
    const cleaned = {
      ...formData,
      supabaseUrl: cleanUrl,
      supabaseAnonKey: cleanKey,
    };
    setFormData(cleaned);
    onSaveSettings(cleaned);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopySchemaSql = () => {
    sound.playTap();
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleTestCloudConnection = async () => {
    const rawUrl = formData.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const rawKey = formData.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const cleanUrl = cleanSupabaseUrl(rawUrl);
    const cleanKey = rawKey.trim();

    if (!cleanUrl || !cleanKey) {
      sound.playAlert();
      setTestResult('Please provide both Supabase URL and Anon Key');
      return;
    }

    if (cleanKey.startsWith('sb_publishable_')) {
      sound.playAlert();
      setTestResult('Key format error: You entered an "sb_publishable_" key. Supabase database access requires the "anon public" key starting with "eyJ..." from the "Legacy anon, service_role API keys" tab.');
      return;
    }

    setIsTestingSupabase(true);
    setTestResult(null);

    try {
      const client = createClient(cleanUrl, cleanKey);
      const { data, error } = await client.from('settings').select('id').limit(1);

      if (error) {
        sound.playAlert();
        setTestResult(`Supabase response: ${error.message} (${error.hint || error.details || 'Check permissions or schema'})`);
      } else {
        sound.playSuccess();
        setTestResult('✓ Cloud Database Connected! Successfully verified communication with Supabase.');
      }
    } catch (err: any) {
      sound.playAlert();
      setTestResult(`Cloud check failed: ${err.message || 'Network error'}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-apple-blue/15 text-apple-blue flex items-center justify-center">
            <Settings className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Restaurant Configuration
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage store branding, tax rates, delivery tariffs, and cloud backup database
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-apple-green/15 text-apple-green flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Saved &amp; Updated
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Store Branding */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Store className="w-4 h-4 text-apple-orange" />
            <span>Store Identity &amp; Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Restaurant Name</label>
              <input
                type="text"
                value={formData.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-bold text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Tagline / Motto</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Contact Phone / Order Hotline</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Physical Address / Branch</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Currency & Charges */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Billing, Taxes &amp; Delivery Tariffs</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                placeholder="Rs."
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Sales Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-bold"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">0% as requested for PKR</span>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Default Delivery Fee ({formData.currency})</label>
              <input
                type="number"
                min="0"
                value={formData.defaultDeliveryFee}
                onChange={(e) => handleChange('defaultDeliveryFee', Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Supabase Cloud Database & Realtime Sync */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-apple-green" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Supabase Cloud Database &amp; Realtime Sync
                </h3>
                {(formData.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-apple-green/15 text-apple-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-apple-green animate-pulse" />
                    Cloud Active
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Automatically syncs orders, tables, catalog, and inventory across all devices in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleTestCloudConnection}
                disabled={isTestingSupabase}
                className="apple-button px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                {isTestingSupabase ? 'Testing Connection...' : 'Test Cloud Connection'}
              </button>

              <button
                type="button"
                onClick={() => setShowAdvancedCloud(!showAdvancedCloud)}
                className="apple-button px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-semibold transition-all flex items-center gap-1"
                title="Configure custom keys or setup guide"
              >
                <span>{showAdvancedCloud ? 'Hide Keys' : 'Configure Keys'}</span>
                {showAdvancedCloud ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-bold ${
              testResult.includes('✓') 
                ? 'bg-apple-green/10 text-apple-green border border-apple-green/20' 
                : 'bg-apple-red/10 text-apple-red border border-apple-red/20'
            }`}>
              {testResult}
            </div>
          )}

          {/* Collapsible Advanced Credentials & Setup Guide */}
          {showAdvancedCloud && (
            <div className="space-y-4 pt-2 border-t border-black/5 dark:border-white/5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  Tip: When deployed on Vercel, credentials are managed via Environment Variables automatically.
                </span>
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  className="text-apple-blue text-xs font-bold hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{showSetupGuide ? 'Hide Instructions' : 'Setup Instructions'}</span>
                </button>
              </div>

              {/* Collapsible Step-by-Step Guide */}
              {showSetupGuide && (
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-3.5 animate-in fade-in duration-200 text-xs">
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Free 4-Step Cloud Setup Walkthrough
                    </span>

                    <button
                      type="button"
                      onClick={handleCopySchemaSql}
                      className="apple-button px-2.5 py-1 rounded-lg bg-apple-blue text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                      title="Copy full PostgreSQL SQL Schema to clipboard"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedSql ? '✓ SQL Copied!' : 'Copy SQL Schema'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
                      <span className="w-5 h-5 rounded-full bg-apple-blue text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        1
                      </span>
                      <div>
                        <strong className="text-neutral-900 dark:text-neutral-100 block">Create Free Project</strong>
                        Sign up at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-apple-blue underline">supabase.com</a> and click "New Project" (e.g. name: <code>hfc-pos</code>).
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
                      <span className="w-5 h-5 rounded-full bg-apple-blue text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        2
                      </span>
                      <div>
                        <strong className="text-neutral-900 dark:text-neutral-100 block">Run SQL in Supabase</strong>
                        In your Supabase project, click <strong>SQL Editor</strong> on the left, paste the schema (click the "Copy SQL Schema" button above), and click <strong>Run</strong>.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
                      <span className="w-5 h-5 rounded-full bg-apple-blue text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        3
                      </span>
                      <div>
                        <strong className="text-neutral-900 dark:text-neutral-100 block">Copy API Credentials</strong>
                        Go to <strong>Project Settings → API Keys</strong>. Copy your <strong>Project URL</strong> and <strong>Publishable key</strong>.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5">
                      <span className="w-5 h-5 rounded-full bg-apple-blue text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        4
                      </span>
                      <div>
                        <strong className="text-neutral-900 dark:text-neutral-100 block">Paste &amp; Connect Below</strong>
                        Paste both keys below, click <strong>Test Cloud Connection</strong>, and hit <strong>Save Changes</strong>!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">Supabase Project URL</label>
                    {formData.supabaseUrl && formData.supabaseUrl.includes('/rest/v1') && (
                      <span className="text-[10px] text-amber-500 font-semibold">auto-cleans /rest/v1/</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.supabaseUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      handleChange('supabaseUrl', val);
                    }}
                    onBlur={(e) => {
                      const cleaned = cleanSupabaseUrl(e.target.value);
                      if (cleaned !== e.target.value) {
                        handleChange('supabaseUrl', cleaned);
                      }
                    }}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Project root URL (e.g. <code>https://djykwsqtlvnnwdoftjpk.supabase.co</code>). Do not include <code>/rest/v1/</code>.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-700 dark:text-neutral-300">Supabase Anon Public Key</label>
                    {formData.supabaseAnonKey?.startsWith('eyJ') && (
                      <span className="text-[10px] text-apple-green font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Valid JWT
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    value={formData.supabaseAnonKey || ''}
                    onChange={(e) => handleChange('supabaseAnonKey', e.target.value.trim())}
                    placeholder="eyJhbGciOi..."
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-mono text-[11px]"
                  />
                  {formData.supabaseAnonKey?.startsWith('sb_publishable_') ? (
                    <p className="text-[10px] text-apple-red font-medium mt-1">
                      ⚠️ Warning: You entered a <code>sb_publishable_</code> key. Supabase PostgREST requires the legacy <code>anon</code> JWT key starting with <code>eyJ...</code> from Project Settings &rarr; API Keys.
                    </p>
                  ) : (
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Legacy <code>anon public</code> JWT key starting with <code>eyJ...</code>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ? (
                  <button
                    type="button"
                    onClick={handleApplyVercelCredentials}
                    className="apple-button px-3 py-1.5 rounded-xl bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load from Vercel Config</span>
                  </button>
                ) : <div />}
                <div className="text-[11px] text-neutral-400">
                  Database Provider: <strong>Supabase (PostgreSQL Free Tier)</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Receipt Footer & Toggles */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-apple-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Printer className="w-4 h-4 text-apple-indigo" />
            <span>Receipt Notes &amp; Audio Feedback</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Thermal Receipt Footer Message</label>
              <textarea
                rows={2}
                value={formData.receiptFooter}
                onChange={(e) => handleChange('receiptFooter', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 mt-1 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Enable Apple Audio Tone Feedback</span>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                className="w-5 h-5 rounded text-apple-blue"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="apple-button w-full sm:w-auto px-8 py-3 rounded-2xl bg-apple-blue hover:bg-apple-blue-hover text-white font-bold text-sm shadow-apple-md transition-all active:scale-[0.98]"
        >
          <Save className="w-4 h-4 mr-2" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
};
