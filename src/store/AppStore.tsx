/**
 * Eén centrale plek voor alle data van de app.
 *
 * Werkt "local-first": alles staat meteen op je toestel (AsyncStorage), en
 * als Supabase ingesteld is wordt het daarnaast gesynchroniseerd zodat de
 * hele groep hetzelfde ziet. Geen Supabase? De app blijft gewoon werken.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Resident } from '../config/residents';
import { DEFAULT_RESIDENTS } from '../config/residents';
import type { TaskDefinition } from '../config/tasks';
import { DEFAULT_TASKS } from '../config/tasks';
import { KEYS, loadJson, removeKey, saveJson } from '../lib/storage';
import { supabase, TABLES, isSupabaseConfigured } from '../lib/supabase';
import type { TaskState, WeekTask } from '../lib/week';
import { buildWeek, stateKey } from '../lib/week';
import { mondayOfWeekIndex, weekIndexOf, weekKey as weekKeyOf } from '../lib/date';

type SyncStatus = 'local' | 'syncing' | 'online' | 'error';

type AppState = {
  ready: boolean;
  sync: SyncStatus;
  residents: Resident[];
  tasks: TaskDefinition[];
  states: Record<string, TaskState>;
  /** Wie ben ik? Eenmalig gekozen, lokaal onthouden. */
  identity: string | null;
};

type AppApi = AppState & {
  me: Resident | null;
  chooseIdentity: (residentId: string) => Promise<void>;
  forgetIdentity: () => Promise<void>;
  weekTasks: (weekIndex: number) => WeekTask[];
  setDone: (task: WeekTask, done: boolean, byResidentId: string | null) => Promise<void>;
  swapTask: (task: WeekTask, assigneeIds: string[] | null) => Promise<void>;
  addResident: (resident: Omit<Resident, 'order'>) => Promise<void>;
  updateResident: (id: string, patch: Partial<Resident>) => Promise<void>;
  removeResident: (id: string) => Promise<void>;
  setTaskActive: (key: string, active: boolean) => Promise<void>;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppApi | null>(null);

/** Supabase-rij -> app-model. */
function rowToResident(row: any): Resident {
  return {
    id: row.id,
    name: row.name,
    floor: row.floor,
    color: row.color,
    order: row.sort_order ?? 0,
    active: row.active ?? true,
  };
}

function residentToRow(r: Resident) {
  return { id: r.id, name: r.name, floor: r.floor, color: r.color, sort_order: r.order, active: r.active };
}

function rowToTaskState(row: any): TaskState {
  return {
    weekKey: row.week_key,
    taskKey: row.task_key,
    weekday: row.weekday,
    assigneeIds: row.assignee_ids ?? null,
    done: row.done ?? false,
    doneBy: row.done_by ?? null,
    doneAt: row.done_at ?? null,
  };
}

function taskStateToRow(s: TaskState) {
  return {
    week_key: s.weekKey,
    task_key: s.taskKey,
    weekday: s.weekday,
    assignee_ids: s.assigneeIds,
    done: s.done,
    done_by: s.doneBy,
    done_at: s.doneAt,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    ready: false,
    sync: isSupabaseConfigured ? 'syncing' : 'local',
    residents: DEFAULT_RESIDENTS,
    tasks: DEFAULT_TASKS,
    states: {},
    identity: null,
  });

  // Klok die elk half uur tikt, zodat "in brand" en "gemist" vanzelf
  // omslaan zonder dat je de app moet herstarten.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** Stap 1: lokale data inladen (snel, werkt offline). */
  useEffect(() => {
    (async () => {
      const [identity, residents, tasks, states] = await Promise.all([
        loadJson<string | null>(KEYS.identity, null),
        loadJson<Resident[]>(KEYS.residents, DEFAULT_RESIDENTS),
        loadJson<TaskDefinition[]>(KEYS.tasks, DEFAULT_TASKS),
        loadJson<Record<string, TaskState>>(KEYS.weekState, {}),
      ]);
      if (!mounted.current) return;
      setState((s) => ({ ...s, identity, residents, tasks, states, ready: true }));
    })();
  }, []);

  /** Stap 2: ophalen bij Supabase (als het ingesteld is). */
  const refresh = useCallback(async () => {
    if (!supabase) return;
    setState((s) => ({ ...s, sync: 'syncing' }));
    try {
      const thisWeek = weekIndexOf(new Date());
      // We halen een venster van 8 weken terug en 8 vooruit op: genoeg om
      // te bladeren, weinig genoeg om snel te blijven.
      const keys = Array.from({ length: 17 }, (_, i) => weekKeyOf(mondayOfWeekIndex(thisWeek - 8 + i)));

      const [residentsRes, tasksRes, statesRes] = await Promise.all([
        supabase.from(TABLES.residents).select('*'),
        supabase.from(TABLES.tasks).select('*'),
        supabase.from(TABLES.weekTasks).select('*').in('week_key', keys),
      ]);

      if (residentsRes.error || tasksRes.error || statesRes.error) throw new Error('sync mislukt');

      const residents = (residentsRes.data ?? []).map(rowToResident);
      const tasks = (tasksRes.data ?? []).map((row: any) => ({
        key: row.key,
        title: row.title,
        subtitle: row.subtitle ?? '',
        kind: row.kind,
        deadlineWeekdays: row.deadline_weekdays ?? [5],
        order: row.sort_order ?? 0,
        active: row.active ?? true,
      })) as TaskDefinition[];

      const states: Record<string, TaskState> = {};
      for (const row of statesRes.data ?? []) {
        const s = rowToTaskState(row);
        states[stateKey(s.weekKey, s.taskKey, s.weekday)] = s;
      }

      if (!mounted.current) return;
      setState((s) => {
        const next = {
          ...s,
          // Lege tabel? Dan houden we de lokale/standaardlijst aan, anders
          // zou de app na een verse installatie leeg staan.
          residents: residents.length ? residents : s.residents,
          tasks: tasks.length ? tasks : s.tasks,
          // Server is de waarheid voor afgevinkt/geruild, aangevuld met wat
          // lokaal bekend is buiten het opgehaalde venster.
          states: { ...s.states, ...states },
          sync: 'online' as SyncStatus,
        };
        void saveJson(KEYS.residents, next.residents);
        void saveJson(KEYS.tasks, next.tasks);
        void saveJson(KEYS.weekState, next.states);
        return next;
      });
    } catch {
      if (mounted.current) setState((s) => ({ ...s, sync: 'error' }));
    }
  }, []);

  useEffect(() => {
    if (state.ready) void refresh();
  }, [state.ready, refresh]);

  /** Stap 3: live meekijken, zodat een ruil of vinkje meteen bij iedereen verschijnt. */
  useEffect(() => {
    if (!supabase) return;
    // Vastpakken in een lokale variabele, zodat de opruimfunctie hieronder
    // zeker met dezelfde (niet-null) client werkt.
    const client = supabase;
    const channel = client
      .channel('bs21-week-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.weekTasks }, (payload: any) => {
        const row = payload.new ?? payload.old;
        if (!row) return;
        const s = rowToTaskState(row);
        setState((prev) => {
          const states = { ...prev.states };
          const k = stateKey(s.weekKey, s.taskKey, s.weekday);
          if (payload.eventType === 'DELETE') delete states[k];
          else states[k] = s;
          void saveJson(KEYS.weekState, states);
          return { ...prev, states };
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.residents }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [refresh]);

  const persistResidents = useCallback(async (residents: Resident[]) => {
    setState((s) => ({ ...s, residents }));
    await saveJson(KEYS.residents, residents);
    if (supabase) {
      await supabase.from(TABLES.residents).upsert(residents.map(residentToRow));
    }
  }, []);

  const api = useMemo<AppApi>(() => {
    const me = state.residents.find((r) => r.id === state.identity) ?? null;

    return {
      ...state,
      me,

      chooseIdentity: async (residentId) => {
        setState((s) => ({ ...s, identity: residentId }));
        await saveJson(KEYS.identity, residentId);
      },

      forgetIdentity: async () => {
        setState((s) => ({ ...s, identity: null }));
        await removeKey(KEYS.identity);
      },

      weekTasks: (weekIndex: number) =>
        buildWeek(state.residents, state.tasks, weekIndex, state.states, now),

      setDone: async (task, done, byResidentId) => {
        const { weekKey, taskKey, weekday } = task;
        const key = stateKey(weekKey, taskKey, weekday);
        const previous = state.states[key];
        const next: TaskState = {
          weekKey,
          taskKey,
          weekday,
          assigneeIds: previous?.assigneeIds ?? null,
          done,
          doneBy: done ? byResidentId : null,
          doneAt: done ? new Date().toISOString() : null,
        };
        setState((s) => {
          const states = { ...s.states, [key]: next };
          void saveJson(KEYS.weekState, states);
          return { ...s, states };
        });
        if (supabase) {
          await supabase
            .from(TABLES.weekTasks)
            .upsert(taskStateToRow(next), { onConflict: 'week_key,task_key,weekday' });
        }
      },

      swapTask: async (task, assigneeIds) => {
        const { weekKey, taskKey, weekday } = task;
        const key = stateKey(weekKey, taskKey, weekday);
        const previous = state.states[key];
        const next: TaskState = {
          weekKey,
          taskKey,
          weekday,
          assigneeIds,
          done: previous?.done ?? false,
          doneBy: previous?.doneBy ?? null,
          doneAt: previous?.doneAt ?? null,
        };
        setState((s) => {
          const states = { ...s.states, [key]: next };
          void saveJson(KEYS.weekState, states);
          return { ...s, states };
        });
        if (supabase) {
          await supabase
            .from(TABLES.weekTasks)
            .upsert(taskStateToRow(next), { onConflict: 'week_key,task_key,weekday' });
        }
      },

      addResident: async (resident) => {
        const order = state.residents.reduce((max, r) => Math.max(max, r.order), -1) + 1;
        await persistResidents([...state.residents, { ...resident, order }]);
      },

      updateResident: async (id, patch) => {
        await persistResidents(state.residents.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      },

      removeResident: async (id) => {
        // We verwijderen niet echt: op non-actief zetten houdt de
        // geschiedenis van afgevinkte taken heel.
        await persistResidents(state.residents.map((r) => (r.id === id ? { ...r, active: false } : r)));
      },

      setTaskActive: async (key, active) => {
        const tasks = state.tasks.map((t) => (t.key === key ? { ...t, active } : t));
        setState((s) => ({ ...s, tasks }));
        await saveJson(KEYS.tasks, tasks);
        if (supabase) {
          await supabase.from(TABLES.tasks).update({ active }).eq('key', key);
        }
      },

      refresh,
    };
  }, [state, now, refresh, persistResidents]);

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp(): AppApi {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp moet binnen <AppProvider> gebruikt worden');
  return ctx;
}
