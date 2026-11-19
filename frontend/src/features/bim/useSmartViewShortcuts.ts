// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP​‌‍⁠​‌‍⁠​‌‍⁠​‌‍⁠
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
/**
 * useSmartViewShortcuts — small persistence layer for the BIM Smart View
 * builder.  Tracks two lists per project, both in ``localStorage``:
 *
 *   - **starred**   — saved group ids the user explicitly pinned (manual)
 *   - **recents**   — saved group ids opened in the builder, MRU-ordered
 *                     (capped at 8 to keep the chip strip tidy)
 *
 * The hook never reaches the network — it just remembers ids and exposes
 * the cross-reference helpers the builder needs to render starred /
 * recent chips above the preset row.  Group metadata (name, color,
 * matched_count) is resolved by the caller against the parent's
 * ``BIMElementGroup[]`` cache.
 *
 * Layout:
 *   localStorage["oe.bim.smartview.shortcuts.v1"] = {
 *     "<projectId>": { starred: [id...], recents: [id...] }
 *   }
 *
 * The "v1" suffix in the key makes a future shape change non-destructive
 * — bump to v2 and ignore older payloads.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'oe.bim.smartview.shortcuts.v1';
const MAX_RECENTS = 8;

interface PerProjectShortcuts {
  starred: string[];
  recents: string[];
}
/** In-memory store. A Map keeps project ids as keys without ever performing
 *  a computed object-key write, so a crafted projectId (e.g. "__proto__")
 *  cannot pollute anything - Map.set is a keyed store, not a property write. */
type Store = Map<string, PerProjectShortcuts>;

function readStore(): Store {
  if (typeof window === 'undefined') return new Map();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as unknown;
    const out: Store = new Map();
    const accept = (projectId: string, value: { starred?: unknown; recents?: unknown }) => {
      if (!Array.isArray(value.starred) || !Array.isArray(value.recents)) return;
      out.set(projectId, {
        starred: value.starred.filter((s): s is string => typeof s === 'string'),
        recents: value.recents.filter((s): s is string => typeof s === 'string'),
      });
    };
    if (Array.isArray(parsed)) {
      // Current format: an entries array of { projectId, starred, recents }.
      for (const entry of parsed) {
        if (!entry || typeof entry !== 'object') continue;
        const e = entry as { projectId?: unknown; starred?: unknown; recents?: unknown };
        if (typeof e.projectId !== 'string') continue;
        accept(e.projectId, e);
      }
      return out;
    }
    if (parsed && typeof parsed === 'object') {
      // Older builds persisted a plain object keyed by project id. Read that
      // shape through Object.entries (a read, not a computed write) so no
      // stored shortcut is lost across the upgrade.
      for (const [projectId, value] of Object.entries(parsed as Record<string, unknown>)) {
        if (!value || typeof value !== 'object') continue;
        accept(projectId, value as { starred?: unknown; recents?: unknown });
      }
    }
    return out;
  } catch {
    return new Map();
  }
}

function writeStore(store: Store): void {
  if (typeof window === 'undefined') return;
  try {
    // Persist an entries array: the shape on disk never carries dynamically
    // computed object keys.
    const entries = [...store.entries()].map(([projectId, value]) => ({
      projectId,
      starred: value.starred,
      recents: value.recents,
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* quota errors are non-fatal */
  }
}

export interface SmartViewShortcuts {
  starred: string[];
  recents: string[];
  isStarred: (id: string) => boolean;
  toggleStar: (id: string) => void;
  pushRecent: (id: string) => void;
  clearRecents: () => void;
}

// Reject prototype-chain keys so a crafted projectId (e.g. a "/bim/__proto__"
// route) can neither pollute the shortcuts map nor read back Object.prototype.
const UNSAFE_SHORTCUT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** React hook — returns starred + recent ids for one project plus mutators. */
export function useSmartViewShortcuts(
  projectId: string | null,
): SmartViewShortcuts {
  const [state, setState] = useState<PerProjectShortcuts>(() => {
    if (!projectId) return { starred: [], recents: [] };
    if (UNSAFE_SHORTCUT_KEYS.has(projectId)) return { starred: [], recents: [] };
    const store = readStore();
    return store.get(projectId) ?? { starred: [], recents: [] };
  });

  // Re-read when the project changes so the chip strip refreshes.
  useEffect(() => {
    if (!projectId) {
      setState({ starred: [], recents: [] });
      return;
    }
    if (UNSAFE_SHORTCUT_KEYS.has(projectId)) {
      setState({ starred: [], recents: [] });
      return;
    }
    const store = readStore();
    setState(store.get(projectId) ?? { starred: [], recents: [] });
  }, [projectId]);

  const persist = useCallback(
    (next: PerProjectShortcuts) => {
      setState(next);
      if (!projectId || UNSAFE_SHORTCUT_KEYS.has(projectId)) return;
      const store = readStore();
      store.set(projectId, next);
      writeStore(store);
    },
    [projectId],
  );

  const isStarred = useCallback(
    (id: string) => state.starred.includes(id),
    [state.starred],
  );

  const toggleStar = useCallback(
    (id: string) => {
      const has = state.starred.includes(id);
      const starred = has
        ? state.starred.filter((s) => s !== id)
        : [id, ...state.starred].slice(0, 32);
      persist({ ...state, starred });
    },
    [state, persist],
  );

  const pushRecent = useCallback(
    (id: string) => {
      const rest = state.recents.filter((r) => r !== id);
      const recents = [id, ...rest].slice(0, MAX_RECENTS);
      persist({ ...state, recents });
    },
    [state, persist],
  );

  const clearRecents = useCallback(() => {
    persist({ ...state, recents: [] });
  }, [state, persist]);

  return useMemo(
    () => ({
      starred: state.starred,
      recents: state.recents,
      isStarred,
      toggleStar,
      pushRecent,
      clearRecents,
    }),
    [state, isStarred, toggleStar, pushRecent, clearRecents],
  );
}

export const SMART_VIEW_SHORTCUTS_KEY = STORAGE_KEY;
export const SMART_VIEW_RECENTS_CAP = MAX_RECENTS;
