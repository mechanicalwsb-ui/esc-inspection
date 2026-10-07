/* ESC Supabase Cloud Sync Engine (Realtime & Cloud-first for GitHub Pages & Standalone) */
(function (root) {
  'use strict';
  const SUPABASE_URL = 'https://vspxrlosnkocophbdubp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_bn9LitCAjOtm95uBHvltZg_-_s5eg7l';
  let isConnected = false;
  let lastUpdatedAt = null;
  let syncTimer = null;
  let isSaving = false;

  async function api(path, method = 'GET', body = null, extraHeaders = {}) {
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    const options = {
      method,
      headers,
      cache: 'no-store'
    };
    if (body) options.body = JSON.stringify(body);
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, options);
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Supabase API error (${resp.status}): ${err}`);
    }
    return resp.status === 204 ? null : await resp.json();
  }

  async function fetchRemote() {
    try {
      const rows = await api('esc_store?id=eq.database&select=id,data,revision,updated_at');
      if (Array.isArray(rows) && rows.length > 0 && rows[0].data) {
        isConnected = true;
        lastUpdatedAt = rows[0].updated_at;
        return rows[0];
      }
      return null;
    } catch (e) {
      console.warn('[SupabaseSync] fetchRemote failed, using offline cache:', e);
      isConnected = false;
      return null;
    }
  }

  async function saveRemote(raw) {
    if (isSaving) return;
    isSaving = true;
    try {
      const payload = {
        id: 'database',
        data: raw,
        revision: (raw.dataRevision || 0) + 1,
        updated_at: new Date().toISOString()
      };
      await api('esc_store', 'POST', payload, { 'Prefer': 'resolution=merge-duplicates' });
      isConnected = true;
      lastUpdatedAt = payload.updated_at;
      updateCloudBanner(true);
    } catch (e) {
      console.warn('[SupabaseSync] saveRemote failed, saved to local store only:', e);
      isConnected = false;
      updateCloudBanner(false);
    } finally {
      isSaving = false;
    }
  }

  function updateCloudBanner(online) {
    const banner = document.getElementById('server-status-banner');
    if (!banner) return;
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (online) {
      banner.className = 'bg-emerald-700 text-white px-6 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 no-print shadow-xs';
      banner.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span> 🟢 ฐานข้อมูลกลางออนไลน์ (Cloud Live · Supabase)
          </span>
          <span>ข้อมูลซิงค์ตรงกับคลาวด์กลางแบบ Real-time ทุกเครื่อง (${timeStr})</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="SupabaseSync.pullNow()" class="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold cursor-pointer">🔄 ซิงค์ข้อมูลล่าสุด</button>
        </div>
      `;
    } else {
      banner.className = 'bg-amber-600 text-white px-6 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 no-print shadow-xs';
      banner.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-white text-amber-900 font-extrabold">⚠️ ออฟไลน์ชั่วคราว</span>
          <span>ไม่สามารถเชื่อมต่อ Supabase ได้ — ระบบใช้ข้อมูลในเครื่องชั่วคราว</span>
        </div>
        <button onclick="SupabaseSync.pullNow()" class="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold cursor-pointer">🔄 ลองเชื่อมต่อใหม่</button>
      `;
    }
  }

  async function pullNow() {
    const remote = await fetchRemote();
    if (remote?.data && window.updateStateData) {
      if (window.ComisStore) ComisStore.save(remote.data);
      updateStateData(remote.data);
      updateCloudBanner(true);
      if (window.showToast) showToast('ซิงค์ข้อมูลจากฐานข้อมูลกลาง Supabase เรียบร้อยแล้ว', 'success');
    }
  }

  function startAutoSync() {
    if (syncTimer) clearInterval(syncTimer);
    syncTimer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const rows = await api('esc_store?id=eq.database&select=updated_at,revision');
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0];
          if (row.updated_at && row.updated_at !== lastUpdatedAt) {
            console.log('[SupabaseSync] Remote change detected, updating local state...');
            await pullNow();
          }
        }
      } catch (_) {}
    }, 15000);
  }

  const SupabaseSync = {
    fetchRemote,
    saveRemote,
    pullNow,
    startAutoSync,
    updateCloudBanner,
    get isConnected() { return isConnected; }
  };

  root.SupabaseSync = SupabaseSync;
})(typeof window === 'undefined' ? globalThis : window);
