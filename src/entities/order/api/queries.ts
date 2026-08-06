import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/api';
import { DeliveryMethod, PaymentMethod } from '../model/types';

// Pure Supabase query functions — one source of truth for both RTK Query's
// queryFn (browser client) and RSC (server client). They throw on failure;
// orderApi.ts's queryFn wrappers translate that into `{ error }`.

export async function fetchDeliveryMethods(db: SupabaseClient<Database>): Promise<DeliveryMethod[]> {
    const { data, error } = await db
        .from('delivery_methods')
        .select('*')
        .eq('is_active', true);

    if (error) throw error;

    return (data ?? []).map((method) => ({
        id: method.id,
        code: method.code,
        label: method.name,
        price: method.price,
        duration: method.estimated_time ?? '',
        freeFromPrice: method.free_from_price,
        isActive: method.is_active
    }));
}

export async function fetchPaymentMethods(db: SupabaseClient<Database>): Promise<PaymentMethod[]> {
    const { data, error } = await db
        .from('payment_methods')
        .select('id, code, fee_percentage, fee_fixed, name')
        .eq('is_active', true);

    if (error) throw error;

    return (data ?? []).map((method) => ({
        id: method.id,
        code: method.code,
        name: method.name,
        feePercentage: method.fee_percentage,
        feeFixed: method.fee_fixed
    }));
}
