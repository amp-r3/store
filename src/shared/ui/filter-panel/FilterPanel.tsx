import { ReactNode, useId, useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';

import { useHaptics } from '@/shared/lib/hooks';

import style from './filter-panel.module.scss';

export interface FilterPanelProps {
  /** Always-visible leading slot — typically a search input. */
  search?: ReactNode;
  /** Always-visible trailing slot for things that aren't filters (e.g. a navigation link). */
  actions?: ReactNode;
  /** Number of filters currently applied — drives the toggle's count chip and its initial expanded state. */
  activeCount?: number;
  /** Label for the disclosure toggle. */
  label?: string;
  children: ReactNode;
}

export const FilterPanel = ({
  search,
  actions,
  activeCount = 0,
  label = 'Filters',
  children,
}: FilterPanelProps) => {
  // Only matters below 600px, where the toggle exists — above that the
  // filters render inline and are always visible regardless of this state.
  const [isExpanded, setIsExpanded] = useState(activeCount > 0);
  const { light } = useHaptics();
  const filtersId = useId();

  const toggleExpanded = () => {
    light();
    setIsExpanded((expanded) => !expanded);
  };

  return (
    <div className={style.panel}>
      {search && <div className={style.panel__search}>{search}</div>}

      <button
        type="button"
        className={style.panel__toggle}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls={filtersId}
      >
        {label}
        {activeCount > 0 && <span className={style.panel__count}>{activeCount}</span>}
        <LuChevronDown
          className={`${style.panel__chevron} ${isExpanded ? style['panel__chevron--expanded'] : ''}`}
          aria-hidden="true"
        />
      </button>

      {actions && <div className={style.panel__actions}>{actions}</div>}

      <div
        id={filtersId}
        className={`${style.panel__filters} ${isExpanded ? style['panel__filters--expanded'] : ''}`}
      >
        <div className={style.panel__filters_inner}>{children}</div>
      </div>
    </div>
  );
};
