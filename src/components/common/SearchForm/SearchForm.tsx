import { ChangeEvent, FC } from 'react';
import { IoClose } from "react-icons/io5";
import styles from './search-form.module.scss';
import { useHaptics } from '@/hooks';

interface SearchFormProps {
    inputValue: string;
    handleSearch: (e: ChangeEvent) => void;
    handleClear: () => void;
    isHomePage: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const SearchForm: FC<SearchFormProps> = ({
    inputValue,
    handleSearch,
    handleClear,
    isHomePage,
    onFocus,
    onBlur

}) => {
    const { soft } = useHaptics()

    return (
        <form
            className={styles.searchForm}
        >
            <div className={styles.searchForm__wrapper}>
                <input
                    id='input'
                    className={styles.searchForm__input}
                    type="text"
                    placeholder='Search'
                    value={inputValue}
                    onChange={handleSearch}
                    disabled={!isHomePage}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                <button
                    type="button"
                    className={`${styles.searchForm__clearBtn} ${inputValue ? styles['searchForm__clearBtn--visible'] : ''}`}
                    onClick={()=>{handleClear(); soft()}}
                    aria-label="Clear search"
                >
                    <IoClose />
                </button>
            </div>
        </form>
    );
}