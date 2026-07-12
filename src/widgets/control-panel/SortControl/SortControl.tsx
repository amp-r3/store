import { FC } from 'react';
import { SortingOption } from '@/features/product-sort';
import { SortBottomSheet } from './SortBottomSheet/SortBottomSheet';
import { SortDropdown } from './SortDropdown/SortDropdown';
import { useMediaQuery } from "@/shared/lib/hooks";

export interface SortControlProps {
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  changeSort: (newSortBy: string | null, newOrder: string | null) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const SortControl: FC<SortControlProps> = (props) => {
  const isMobile = useMediaQuery('(max-width: 549px)');

  if (isMobile) {
    return <SortBottomSheet {...props} />;
  }

  return <SortDropdown {...props} />;
};