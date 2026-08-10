import { test as teardown } from '@playwright/test';
import { createSupabaseAdminClient } from './support/supabaseAdmin';
import { e2eEnv } from './support/env';

/** Undoes everything P0-4 (checkout.spec.ts) writes to the shared remote
 * Supabase project: restores the stock `create_order` decremented, then
 * deletes the orders it created (`order_items`/`order_status_events`
 * cascade — schema.sql's `ON DELETE CASCADE`). Uses the service-role key
 * because `orders`/`order_items` have zero write policies for the
 * anon/user key by design (AGENTS.md) — this is the only way to clean up.
 * Idempotent: safe to re-run if a previous run was interrupted. */
teardown('restore stock and delete e2e orders', async () => {
  const admin = createSupabaseAdminClient();
  const email = e2eEnv.userEmail;

  const { data: existing, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw new Error(`Failed to list users: ${listError.message}`);
  const user = existing.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return;

  const { data: orders, error: ordersError } = await admin
    .from('orders')
    .select('id')
    .eq('user_id', user.id);
  if (ordersError) throw new Error(`Failed to list e2e orders: ${ordersError.message}`);

  for (const order of orders ?? []) {
    const { data: items, error: itemsError } = await admin
      .from('order_items')
      .select('size_id, quantity')
      .eq('order_id', order.id);
    if (itemsError) throw new Error(`Failed to list order items: ${itemsError.message}`);

    for (const item of items ?? []) {
      const { data: size, error: sizeError } = await admin
        .from('product_sizes')
        .select('stock')
        .eq('id', item.size_id)
        .single();
      if (sizeError || !size) continue; // size may itself have been removed by other cleanup

      const { error: restoreError } = await admin
        .from('product_sizes')
        .update({ stock: size.stock + item.quantity })
        .eq('id', item.size_id);
      if (restoreError) throw new Error(`Failed to restore stock: ${restoreError.message}`);
    }

    const { error: deleteError } = await admin.from('orders').delete().eq('id', order.id);
    if (deleteError) throw new Error(`Failed to delete e2e order: ${deleteError.message}`);
  }

  await admin.from('notifications').delete().eq('user_id', user.id);
  await admin.from('cart_items').delete().eq('user_id', user.id);
});
