/**
 * Generic, reusable data access layer on top of Supabase.
 * All functions are typed against the Database schema.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/errors';

type PublicTables = Database['public']['Tables'];
type TableName = keyof PublicTables;
type TableRow<T extends TableName> = PublicTables[T]['Row'];
type TableInsert<T extends TableName> = PublicTables[T]['Insert'];
type TableUpdate<T extends TableName> = PublicTables[T]['Update'];

export interface GetAllOptions {
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  offset?: number;
  filters?: Record<string, string | number | boolean | null>;
  searchColumn?: string;
  searchValue?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── getAll ────────────────────────────────────────────────────
export async function getAll<T extends TableName>(
  tableName: T,
  options: GetAllOptions = {}
): Promise<PaginatedResult<TableRow<T>>> {
  const {
    orderBy = 'created_at',
    ascending = false,
    limit = 50,
    offset = 0,
    filters,
    searchColumn,
    searchValue,
  } = options;

  logger.debug(`getAll(${tableName})`, options);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from(tableName) as any)
    .select('*', { count: 'exact' })
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);

  if (filters) {
    for (const [col, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== '') {
        query = query.eq(col, val);
      }
    }
  }

  if (searchColumn && searchValue) {
    query = query.ilike(searchColumn, `%${searchValue}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    const msg = handleSupabaseError(error, `getAll(${tableName})`);
    throw new Error(msg);
  }

  const total = count ?? 0;
  return {
    data: (data ?? []) as TableRow<T>[],
    count: total,
    page: Math.floor(offset / limit),
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── getById ───────────────────────────────────────────────────
export async function getById<T extends TableName>(
  tableName: T,
  id: string
): Promise<TableRow<T> | null> {
  logger.debug(`getById(${tableName}, ${id})`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from(tableName) as any)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    const msg = handleSupabaseError(error, `getById(${tableName})`);
    throw new Error(msg);
  }

  return (data ?? null) as TableRow<T> | null;
}

// ── createRecord ─────────────────────────────────────────────
export async function createRecord<T extends TableName>(
  tableName: T,
  data: TableInsert<T>
): Promise<TableRow<T>> {
  logger.debug(`createRecord(${tableName})`, data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error } = await (supabase.from(tableName) as any)
    .insert(data)
    .select()
    .single();

  if (error) {
    const msg = handleSupabaseError(error, `createRecord(${tableName})`);
    throw new Error(msg);
  }

  return row as TableRow<T>;
}

// ── updateRecord ─────────────────────────────────────────────
export async function updateRecord<T extends TableName>(
  tableName: T,
  id: string,
  data: TableUpdate<T>
): Promise<TableRow<T>> {
  logger.debug(`updateRecord(${tableName}, ${id})`, data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error } = await (supabase.from(tableName) as any)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const msg = handleSupabaseError(error, `updateRecord(${tableName})`);
    throw new Error(msg);
  }

  return row as TableRow<T>;
}

// ── deleteRecord ─────────────────────────────────────────────
export async function deleteRecord<T extends TableName>(
  tableName: T,
  id: string
): Promise<void> {
  logger.debug(`deleteRecord(${tableName}, ${id})`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from(tableName) as any)
    .delete()
    .eq('id', id);

  if (error) {
    const msg = handleSupabaseError(error, `deleteRecord(${tableName})`);
    throw new Error(msg);
  }
}

// ── upsertRecord ─────────────────────────────────────────────
export async function upsertRecord<T extends TableName>(
  tableName: T,
  data: TableInsert<T>,
  conflictColumns?: string
): Promise<TableRow<T>> {
  logger.debug(`upsertRecord(${tableName})`, data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from(tableName) as any).upsert(data);
  if (conflictColumns) {
    query = query.onConflict(conflictColumns);
  }

  const { data: row, error } = await query.select().single();

  if (error) {
    const msg = handleSupabaseError(error, `upsertRecord(${tableName})`);
    throw new Error(msg);
  }

  return row as TableRow<T>;
}
