import { ChangeEvent, FC, useEffect, useRef } from 'react';
import { useHaptics } from '@/shared/lib/hooks';
import { IoClose } from "react-icons/io5";
import styles from './search-form.module.scss';

interface SearchFormProps {
    inputValue: string;
    handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
    handleClear: () => void;
    onSubmit?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    autoFocus?: boolean;
}

export const SearchForm: FC<SearchFormProps> = ({
    inputValue,
    handleSearch,
    handleClear,
    onSubmit,
    onFocus,
    onBlur,
    autoFocus

}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const { soft } = useHaptics()
    const blurInput = () => {
        if (inputRef.current) {
            inputRef.current.blur();
        }
    }

    useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [autoFocus]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        soft();
        onSubmit?.();
        blurInput();
    }

    return (
        <form
            className={styles.searchForm}
            role="search"
            onSubmit={handleFormSubmit}
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
                    onFocus={onFocus}
                    onBlur={onBlur}
                    autoFocus={autoFocus}
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
        </form>
    );
}