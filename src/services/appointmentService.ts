import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentStatus, CreateAppointmentDto, UpdateAppointmentDto, ServiceItem, ReferenceImage } from '@/types';

interface AppointmentRow {
  id: string;
  client_id: string | null;
  client_name: string;
  phone: string;
  email: string | null;
  services: any; // JSONB
  date: string;
  time: string;
  status: string;
  payment_method_id: string | null;
  reference_images: any; // ✅ JSONB pour les images multiples
  client_notes: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function rowToAppointment(r: AppointmentRow): Appointment {
  const services = (r.services as ServiceItem[]) || [];
  const referenceImages = (r.reference_images as ReferenceImage[]) || [];
  
  return {
    id: r.id,
    clientId: r.client_id ?? undefined,
    clientName: r.client_name,
    phone: r.phone,
    email: r.email ?? undefined,
    services: services,
    date: r.date,
    time: r.time,
    status: r.status as AppointmentStatus,
    paymentMethodId: r.payment_method_id ?? undefined,
    referenceImages: referenceImages, // ✅ Tableau d'images
    clientNotes: r.client_notes ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  };
}

function patchToRow(data: UpdateAppointmentDto): Partial<AppointmentRow> {
  const row: Record<string, unknown> = {};
  if (data.clientId !== undefined) row.client_id = data.clientId ?? null;
  if (data.clientName !== undefined) row.client_name = data.clientName;
  if (data.phone !== undefined) row.phone = data.phone;
  if (data.email !== undefined) row.email = data.email ?? null;
  if (data.date !== undefined) row.date = data.date;
  if (data.time !== undefined) row.time = data.time;
  if (data.status !== undefined) row.status = data.status;
  if (data.paymentMethodId !== undefined) row.payment_method_id = data.paymentMethodId ?? null;
  if (data.referenceImages !== undefined) row.reference_images = data.referenceImages; // ✅ Tableau d'images
  if (data.clientNotes !== undefined) row.client_notes = data.clientNotes ?? null;
  if (data.notes !== undefined) row.notes = data.notes ?? null;
  return row as Partial<AppointmentRow>;
}

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        payment_method:payment_method_id (
          id,
          name,
          label,
          icon
        )
      `)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    if (error) throw error;
    return (data as AppointmentRow[]).map(rowToAppointment);
  },

  async getById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        payment_method:payment_method_id (
          id,
          name,
          label,
          icon
        )
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return rowToAppointment(data as AppointmentRow);
  },

  async getByDate(date: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        payment_method:payment_method_id (
          id,
          name,
          label,
          icon
        )
      `)
      .eq('date', date)
      .order('time', { ascending: true });
    if (error) throw error;
    return (data as AppointmentRow[]).map(rowToAppointment);
  },

  async getByClientEmail(email: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        payment_method:payment_method_id (
          id,
          name,
          label,
          icon
        )
      `)
      .eq('email', email)
      .order('date', { ascending: true });
    if (error) throw error;
    return (data as AppointmentRow[]).map(rowToAppointment);
  },

  async create(data: CreateAppointmentDto): Promise<Appointment> {
    if (!data.serviceIds || data.serviceIds.length === 0) {
      throw new Error('Au moins un service est requis');
    }

    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('id, name, price, duration')
      .in('id', data.serviceIds);

    if (servicesError) throw servicesError;
    if (!servicesData || servicesData.length === 0) {
      throw new Error('Services non trouvés');
    }

    const services: ServiceItem[] = servicesData.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
    }));

    // Tout passe par `create_public_appointment` : une fonction SECURITY
    // DEFINER qui relit les tarifs en base, vérifie la disponibilité du
    // créneau, rattache ou crée la fiche client et programme le rappel — le
    // tout en une transaction.
    //
    // Les faire depuis le navigateur imposerait d'ouvrir la table `clients`
    // à la lecture anonyme, et laisserait le tarif à la main de l'appelant.
    const { data: newId, error: rpcError } = await supabase.rpc(
      'create_public_appointment',
      {
        p_client_name: data.clientName,
        p_phone: data.phone,
        p_email: data.email ?? null,
        p_service_ids: data.serviceIds,
        p_date: data.date,
        p_time: data.time,
        p_payment_method_id: data.paymentMethodId ?? null,
        p_reference_images: data.referenceImages ?? [],
        p_client_notes: data.clientNotes ?? null,
      },
    );

    if (rpcError) throw new Error(rpcError.message);

    // La ligne créée n'est pas relisible par un visiteur anonyme — et c'est
    // voulu. L'écran de confirmation n'a besoin de rien de plus que ce qui
    // vient d'être soumis, complété de l'identifiant retourné.
    return {
      id: newId as string,
      clientId: data.clientId,
      clientName: data.clientName,
      phone: data.phone,
      email: data.email,
      services,
      date: data.date,
      time: data.time,
      status: 'pending',
      paymentMethodId: data.paymentMethodId,
      referenceImages: data.referenceImages ?? [],
      clientNotes: data.clientNotes,
      notes: data.notes,
    };
  },

  async update(id: string, data: UpdateAppointmentDto): Promise<Appointment> {
    // Les rappels suivent automatiquement : annulation, déplacement et
    // changement de prestations sont traités par le déclencheur
    // `appointments_sync_reminders`. Le faire ici imposerait de lire
    // `reminder_settings`, réservé aux administrateurs — ce qui empêchait
    // un client d'annuler son propre rendez-vous.
    const row = patchToRow(data);

    if (data.serviceIds !== undefined) {
      if (data.serviceIds.length === 0) {
        throw new Error('Au moins un service est requis');
      }

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, price, duration')
        .in('id', data.serviceIds);

      if (servicesError) throw servicesError;
      if (!servicesData || servicesData.length === 0) {
        throw new Error('Services non trouvés');
      }

      const services: ServiceItem[] = servicesData.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
      }));

      (row as any).services = services;
    }

    const { data: oldAppointment } = await supabase
      .from('appointments')
      .select('client_id, status')
      .eq('id', id)
      .single();

    const { data: updatedRow, error } = await supabase
      .from('appointments')
      .update(row)
      .eq('id', id)
      .select(`
        *,
        payment_method:payment_method_id (
          id,
          name,
          label,
          icon
        )
      `)
      .single();

    if (error) throw error;
    
    const appointment = rowToAppointment(updatedRow as AppointmentRow);

    if (data.status === 'confirmed' && oldAppointment?.status !== 'confirmed') {
      try {
        const { data: loyaltySettings } = await supabase
          .from('loyalty_settings')
          .select('points_per_visit')
          .maybeSingle();

        const pointsToAdd = loyaltySettings?.points_per_visit ?? 10;

        if (appointment.clientId) {
          const { data: client } = await supabase
            .from('clients')
            .select('loyalty_points')
            .eq('id', appointment.clientId)
            .single();

          const currentPoints = client?.loyalty_points ?? 0;
          
          await supabase
            .from('clients')
            .update({ loyalty_points: currentPoints + pointsToAdd })
            .eq('id', appointment.clientId);

          console.log(`⭐ ${pointsToAdd} points de fidélité ajoutés pour ${appointment.clientName}`);
        }
      } catch (loyaltyError) {
        console.error('Erreur lors de l\'ajout des points de fidélité:', loyaltyError);
      }
    }

    return appointment;
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const appointment = await appointmentService.update(id, { status });
    return appointment;
  },

  async delete(id: string): Promise<void> {
    // Les rappels partent avec : la clé étrangère est en ON DELETE CASCADE.
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
  },
};