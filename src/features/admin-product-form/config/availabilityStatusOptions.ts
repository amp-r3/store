// The DB column (products.availability_status) is plain nullable text with
// no enum/CHECK behind it — nothing in the schema constrains its values, so
// this vocabulary is owned entirely by the admin UI.
export const AVAILABILITY_STATUS_OPTIONS = [
  { value: 'In Stock', label: 'In Stock' },
  { value: 'Low Stock', label: 'Low Stock' },
  { value: 'Out of Stock', label: 'Out of Stock' },
] as const;
