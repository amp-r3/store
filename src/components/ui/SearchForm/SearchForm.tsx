import { FC, FormEvent, ChangeEvent } from 'react';
import { IoSearchSharp, IoClose } from "react-icons/io5";
import styles from './search-form.module.scss';

interface SearchFormProps {
    inputValue: string;
    handleSearch: (e: FormEvent) => void;
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleClear: () => void;
    isHomePage: boolean;
}

const SearchForm: FC<SearchFormProps> = ({
    inputValue,
    handleSearch,
    handleInputChange,
    handleClear,
    isHomePage
}) => {

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
                disabled={!isHomePage || !inputValue}
            >
                <IoSearchSharp />
            </button>
        </form>
    );
}

export default SearchForm