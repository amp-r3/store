import { ChangeEvent, FC, KeyboardEventHandler, useRef } from 'react';
import { IoClose } from "react-icons/io5";
import styles from './search-form.module.scss';
import { useHaptics } from '@/hooks';

interface SearchFormProps {
    inputValue: string;
    handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
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
    const inputRef = useRef<HTMLInputElement>(null)
    const { soft } = useHaptics()
    const blurInput = () => {
        if (inputRef.current) {
            inputRef.current.blur();
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            soft();
            blurInput();
        }
    }

    return (
        <div
            className={styles.searchForm}
        >
            <div className={styles.searchForm__wrapper}>
                <input
                    id='input'
                    className={styles.searchForm__input}
                    type="text"
                    ref={inputRef}
                    placeholder='Search'
                    value={inputValue}
                    onChange={handleSearch}
                    onKeyDown={handleKeyDown}
                    disabled={!isHomePage}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                <button
                    type="button"
                    className={`${styles.searchForm__clearBtn} ${inputValue ? styles['searchForm__clearBtn--visible'] : ''}`}
                    onClick={() => { handleClear(); soft(); blurInput(); }}
                    aria-label="Clear search"

                >
                    <IoClose />
                </button>
            </div>
        </div>
    );
}