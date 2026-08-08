import { useCallback, useEffect, useState } from 'react';
import { imageSlotService } from '@/services/imageSlotService';
import type { ImageSlot, CreateImageSlotDto, UpdateImageSlotDto } from '@/types';

interface UseImageSlotsReturn {
  slots: ImageSlot[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSlot: (data: CreateImageSlotDto) => Promise<void>;
  updateSlot: (id: string, data: UpdateImageSlotDto) => Promise<void>;
  removeSlot: (id: string) => Promise<void>;
}

/**
 * @param activeOnly `true` côté public — l'administration a besoin de voir
 * aussi les emplacements désactivés pour pouvoir les réactiver.
 */
export function useImageSlots(activeOnly = false): UseImageSlotsReturn {
  const [slots, setSlots] = useState<ImageSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setSlots(activeOnly ? await imageSlotService.getActive() : await imageSlotService.getAll());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    slots,
    loading,
    error,
    refresh: load,
    createSlot: async (data) => {
      await imageSlotService.create(data);
      await load();
    },
    updateSlot: async (id, data) => {
      await imageSlotService.update(id, data);
      await load();
    },
    removeSlot: async (id) => {
      await imageSlotService.remove(id);
      await load();
    },
  };
}