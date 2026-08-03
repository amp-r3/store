// Fixed by every log_admin_action(...) call site across the admin RPCs
// (schema.sql) — not queried from the DB, since the values are a closed,
// hand-written vocabulary, not user data.
export const AUDIT_ACTIONS = [
    'order.status_update',
    'product.create',
    'product.update',
    'product.archive',
    'product_size.create',
    'product_size.update',
    'product_size.set_stock',
    'product_size.delete',
    'category.create',
    'category.update',
    'category.delete',
    'review.delete',
    'user.set_role',
    'delivery_method.update',
    'payment_method.update',
] as const;

export const AUDIT_ENTITY_TYPES = [
    'order',
    'product',
    'product_size',
    'category',
    'product_review',
    'profile',
    'delivery_method',
    'payment_method',
] as const;

// Record<string, string> rather than Record<AuditAction, string>: a future
// RPC adding a new action must not make this page throw, only fall back to
// the raw value below.
export const AUDIT_ACTION_LABELS: Record<string, string> = {
    'order.status_update': 'Order status updated',
    'product.create': 'Product created',
    'product.update': 'Product updated',
    'product.archive': 'Product archived',
    'product_size.create': 'Size added',
    'product_size.update': 'Size updated',
    'product_size.set_stock': 'Stock updated',
    'product_size.delete': 'Size deleted',
    'category.create': 'Category created',
    'category.update': 'Category updated',
    'category.delete': 'Category deleted',
    'review.delete': 'Review deleted',
    'user.set_role': 'Role changed',
    'delivery_method.update': 'Delivery method updated',
    'payment_method.update': 'Payment method updated',
};

export const AUDIT_ENTITY_LABELS: Record<string, string> = {
    order: 'Order',
    product: 'Product',
    product_size: 'Product size',
    category: 'Category',
    product_review: 'Review',
    profile: 'Profile',
    delivery_method: 'Delivery method',
    payment_method: 'Payment method',
};
