import { HistoryItem } from '../types';

/**
 * 生成符合 RFC 4122 标准的 UUID v4 字符串
 * 确保完全兼容 Supabase 的 uuid 数据库类型
 */
const generateV4UUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 验证字符串是否为合法的 UUID 格式
 */
const isValidUUID = (uuid: string): boolean => {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return re.test(uuid);
};

const getEnv = () => {
  // 🔴 Use standard Vite environment variables for security
  // Safe access in case import.meta.env is undefined
  const env = (import.meta as any).env || {};
  return {
    url: env.VITE_SUPABASE_URL || '',
    key: env.VITE_SUPABASE_KEY || ''
  };
};

const LOCAL_STORE = 'divination_history';

export const storageProvider = {
  async save(item: HistoryItem): Promise<void> {
    const { url, key } = getEnv();
    
    if (!isValidUUID(item.id)) {
      item.id = generateV4UUID();
    }

    console.log('%c📡 [Storage] Saving...', 'color: #3b82f6;', { id: item.id, found: item.found });
    
    // 1. Save Local
    this.saveToLocal(item);

    // 2. Sync Cloud (Upsert)
    if (!url || !key) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${url}/rest/v1/divination_history`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal' 
        },
        body: JSON.stringify({
          id: item.id, 
          item_name: item.input.itemName,
          data: item    
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      console.log('%c✅ [Storage] Synced.', 'color: #10b981;');
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error('%c❌ [Storage] Sync failed:', 'color: #ef4444', e.message);
    }
  },

  // Update status wrapper
  async markAsFound(id: string): Promise<HistoryItem | null> {
    const items = this.getLocalSync();
    const target = items.find(i => i.id === id);
    if (target) {
      target.found = true;
      await this.save(target); // Reuse save for upsert
      return target;
    }
    return null;
  },

  async getAll(): Promise<HistoryItem[]> {
    const { url, key } = getEnv();
    if (!url || !key) return this.getLocal();

    try {
      const response = await fetch(`${url}/rest/v1/divination_history?select=data&order=created_at.desc.nullslast&limit=30`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
      
      const json = await response.json();
      const remoteData = json.map((row: any) => row.data);
      const localData = this.getLocalSync();
      
      // Merge: Remote takes precedence if IDs match (to sync 'found' status from other devices)
      const combined = [...remoteData, ...localData];
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
        } else {
            // If duplicate, prefer the one with 'found: true'
            const existing = uniqueMap.get(item.id);
            if (!existing.found && item.found) {
                uniqueMap.set(item.id, item);
            }
        }
      });
      
      return Array.from(uniqueMap.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
    } catch (e) {
      return this.getLocal();
    }
  },

  saveToLocal(item: HistoryItem) {
    try {
      const history = this.getLocalSync();
      const index = history.findIndex(h => h.id === item.id);
      let updated;
      if (index > -1) {
        updated = [...history];
        updated[index] = item;
      } else {
        updated = [item, ...history];
      }
      localStorage.setItem(LOCAL_STORE, JSON.stringify(updated.slice(0, 50)));
    } catch (e) {}
  },

  getLocal(): Promise<HistoryItem[]> {
    return Promise.resolve(this.getLocalSync());
  },

  getLocalSync(): HistoryItem[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
};