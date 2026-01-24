import { FC, FormEvent, ChangeEvent } from 'react';
import { IoSearchSharp, IoClose } from "react-icons/io5";
import styles from './search-form.module.scss';

interface SearchFormProps {
    inputValue: string;
    handleSearch: (e: FormEvent) => void;
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleClear: () => void;
    toggleSearch: () => void;
    isActive: boolean;
    isHomePage: boolean;
}

const SearchForm: FC<SearchFormProps> = ({
    inputValue,
    handleSearch,
    handleInputChange,
    handleClear,
    toggleSearch,
    isActive,
    isHomePage
}) => {

    return (
        <form
            onSubmit={handleSearch}
            className={`${styles.searchForm} ${isActive ? styles['searchForm--active'] : ''}`}
        >
            <div className={styles.searchForm__wrapper}>
                <input
                    className={styles.searchForm__input}
                    type="text"
                    placeholder="Search..."
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={!isHomePage}
                />
                <button
                    type="button"
                    className={`${styles.searchForm__clearBtn} ${inputValue ? styles['searchForm__clearBtn--visible'] : ''}`}
                    onClick={handleClear}
                    aria-label="Clear search"
                    >
                    <IoClose />
                </button>
            </div>
            <button
                type="submit"
                className={styles.searchForm__submitBtn}
                aria-label="Search"
                onClick={toggleSearch}
                disabled={!isHomePage || !inputValue}
            >
                <IoSearchSharp />
            </button>
        </form>
    );
}

export default SearchForm