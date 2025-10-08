import { IoSwapVertical } from 'react-icons/io5';
import style from './sortPanel.module.scss';

const SortPanel = ({ options, currentSort, onSortChange }) => {
  return (
    <div className={style.sort_panel}>
      <div className={style.sort_panel__header}>
        <IoSwapVertical className={style.sort_panel__icon} />
        <span className={style.sort_panel__label}>Sort:</span>
      </div>
      <div className={style.sort_panel__options}>
        {options.map((option) => (
          <button
            key={option.id}
            className={`${style.sort_panel__button} ${
              option.id === currentSort ? style.sort_panel__button__active : ''
            }`}
            onClick={() => onSortChange(option.id)}
          >
            {option.icon && <span className={style.sort_panel__button_icon}>{option.icon && <option.icon />}</span>}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortPanel;