import { FC } from 'react';
import { SortingOption } from '@/utils/sortingOptions';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SortBottomSheet } from './SortBottomSheet/SortBottomSheet';
import { SortDropdown } from './SortDropdown/SortDropdown';

export interface SortControlProps {
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  triggerRef: React.RefObject<HTMLButtonElement>;
  changeSort: (newSortBy: string) => void;
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