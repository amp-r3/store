import { IoSwapVertical, IoChevronDown } from 'react-icons/io5';
import style from './sortPanel.module.scss';
import { useMediaQuery } from '@/hooks';
import { useState } from 'react';


const SortPanel = ({ options, currentSort, onSortChange, activeSortOption }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobileAccordion = useMediaQuery('(max-width: 550px)');

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const headerContent = (
    <>
      <IoSwapVertical className={style.sort_panel__icon} />
      <span className={style.sort_panel__label}>
        Sort: {activeSortOption}
      </span>
      {isMobileAccordion && (
        <IoChevronDown
          className={`${style.sort_panel__chevron} ${isExpanded ? style.expanded : ''}`}
          aria-hidden="true"
        />
      )}
    </>
  );

  return (
    <div className={style.sort_panel}>
      {isMobileAccordion ? (
        <button
          className={style.sort_panel__header}
          onClick={handleToggle}
          aria-expanded={isExpanded}
        >
          {headerContent}
        </button>
      ) : (
        <div className={style.sort_panel__header}>
          {headerContent}
        </div>
      )}

      <div className={`${style.sort_panel__options} ${isMobileAccordion && isExpanded ? style.expanded : ''}`}>
        <div>
          {options.map((option) => (
            <button
              key={option.id}
              className={`${style.sort_panel__button} ${option.id === currentSort ? style.sort_panel__button__active : ''
                }`}
              onClick={() => onSortChange(option.id)}
            >
              {option.icon && (
                <span className={style.sort_panel__button_icon}>
                  <option.icon />
                </span>
              )}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortPanel;