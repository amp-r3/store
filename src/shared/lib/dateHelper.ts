export type DateFormatVariant = 'compact' | 'medium' | 'full';

const DATE_FORMAT_OPTIONS: Record<DateFormatVariant, Intl.DateTimeFormatOptions> = {
  compact: { month: 'short', day: 'numeric' },
  medium: { year: 'numeric', month: 'short', day: 'numeric' },
  full: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
};

export const formatDate = (date: string, variant: DateFormatVariant = 'medium') => {
  return new Date(date).toLocaleString('en-US', DATE_FORMAT_OPTIONS[variant]);
};
