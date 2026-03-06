import { FC, FormEvent, ChangeEvent } from 'react';
import { IoSearchSharp, IoClose } from "react-icons/io5";
import styles from './search-form.module.scss';
import { useHaptics } from '@/hooks';

interface SearchFormProps {
    inputValue: string;
    handleSearch: (e: FormEvent) => void;
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleClear: () => void;
    isHomePage: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const SearchForm: FC<SearchFormProps> = ({
    inputValue,
    handleSearch,
    handleInputChange,
    handleClear,
    isHomePage,
    onFocus,
    onBlur

}) => {
    const { soft } = useHaptics()

    return (
        <form
            onSubmit={handleSearch}
            className={styles.searchForm}
        >
            <div className={styles.searchForm__wrapper}>
                <input
                    id='input'
                    className={styles.searchForm__input}
                    type="text"
                    placeholder='Search'
                    value={inputValue}
                    onChange={handleInputChange}
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
            <button
                type="submit"
                className={styles.searchForm__submitBtn}
                aria-label="Search"
                disabled={!isHomePage || !inputValue}
                onClick={soft}
            >
                <IoSearchSharp />
            </button>
        </form>
    );
}