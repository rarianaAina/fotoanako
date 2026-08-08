import { supabase } from '@/lib/supabase';

import type { LoyaltySettings, LoyaltySettingsUpdateDto } from '@/types';

interface LoyaltySettingsRow {
  id: string;
  points_per_visit: number;
  reward_threshold: number;
  reward_label: string;
  updated_at: string | null;
}

function rowToSettings(r: LoyaltySettingsRow): LoyaltySettings {
  return {
    id: r.id,
    pointsPerVisit: r.points_per_visit,
    rewardThreshold: r.reward_threshold,
    rewardLabel: r.reward_label,
    updatedAt: r.updated_at ?? undefined,
  };
}

export const loyaltyService = {
  // Récupérer les points d'un client
  async getClientPoints(clientId: string): Promise<number> {
    const { data, error } = await supabase
      .from('clients')
      .select('loyalty_points')
      .eq('id', clientId)
      .single();

    if (error) throw error;
    return data?.loyalty_points ?? 0;
  },

  // Récupérer les points d'un client par user_id
  async getClientPointsByUserId(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('clients')
      .select('loyalty_points')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.loyalty_points ?? 0;
  },

  // Récupérer les paramètres de fidélité
  async getSettings(): Promise<LoyaltySettings> {
    const { data, error } = await supabase
      .from('loyalty_settings')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Créer les paramètres par défaut
      const { data: created, error: createError } = await supabase
        .from('loyalty_settings')
        .insert({ points_per_visit: 10 })
        .select()
        .single();

      if (createError) throw createError;
      return rowToSettings(created as LoyaltySettingsRow);
    }

    return rowToSettings(data as LoyaltySettingsRow);
  },

  // Mettre à jour les paramètres de fidélité
  async updateSettings(data: LoyaltySettingsUpdateDto): Promise<LoyaltySettings> {
    const row: Record<string, unknown> = {};
    if (data.pointsPerVisit !== undefined) row.points_per_visit = data.pointsPerVisit;
    if (data.rewardThreshold !== undefined) row.reward_threshold = data.rewardThreshold;
    if (data.rewardLabel !== undefined) row.reward_label = data.rewardLabel;

    const { data: existing } = await supabase
      .from('loyalty_settings')
      .select('id')
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('loyalty_settings')
        .update(row)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return rowToSettings(data as LoyaltySettingsRow);
    } else {
      const { data, error } = await supabase
        .from('loyalty_settings')
        .insert(row)
        .select()
        .single();

      if (error) throw error;
      return rowToSettings(data as LoyaltySettingsRow);
    }
  },
};