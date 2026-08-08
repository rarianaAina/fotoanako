import { supabase } from '@/lib/supabase';
import type { ImageSlot, CreateImageSlotDto, UpdateImageSlotDto } from '@/types';

interface ImageSlotRow {
  id: string;
  key: string;
  label: string;
  hint: string | null;
  max_files: number;
  required: boolean;
  sort_order: number;
  active: boolean;
}

function rowToSlot(r: ImageSlotRow): ImageSlot {
  return {
    id: r.id,
    key: r.key,
    label: r.label,
    hint: r.hint ?? undefined,
    maxFiles: r.max_files,
    required: r.required,
    sortOrder: r.sort_order,
    active: r.active,
  };
}

export const imageSlotService = {
  /** Tous les emplacements, actifs ou non — pour l'administration. */
  async getAll(): Promise<ImageSlot[]> {
    const { data, error } = await supabase
      .from('image_slots')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data as ImageSlotRow[]).map(rowToSlot);
  },

  /** Uniquement ceux à présenter au client. */
  async getActive(): Promise<ImageSlot[]> {
    const { data, error } = await supabase
      .from('image_slots')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data as ImageSlotRow[]).map(rowToSlot);
  },

  async create(data: CreateImageSlotDto): Promise<ImageSlot> {
    const { data: row, error } = await supabase
      .from('image_slots')
      .insert({
        key: data.key,
        label: data.label,
        hint: data.hint ?? null,
        max_files: data.maxFiles ?? 3,
        required: data.required ?? false,
        sort_order: data.sortOrder ?? 0,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToSlot(row as ImageSlotRow);
  },

  async update(id: string, data: UpdateImageSlotDto): Promise<void> {
    const row: Record<string, unknown> = {};
    if (data.key !== undefined) row.key = data.key;
    if (data.label !== undefined) row.label = data.label;
    if (data.hint !== undefined) row.hint = data.hint || null;
    if (data.maxFiles !== undefined) row.max_files = data.maxFiles;
    if (data.required !== undefined) row.required = data.required;
    if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
    if (data.active !== undefined) row.active = data.active;

    const { error } = await supabase.from('image_slots').update(row).eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('image_slots').delete().eq('id', id);
    if (error) throw error;
  },
};