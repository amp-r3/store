import { Link } from 'react-router';
import { FaChevronRight } from "react-icons/fa6";
import style from './breadcrumbs.module.scss';

export interface BreadcrumbItem {
    label: string;
    path?: string;
    onClick?: () => void;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    if (!items || items.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className={style['breadcrumbs']}>
            <ol className={style['breadcrumbs__list']}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className={style['breadcrumbs__item']}>
                            {item.path ? (
                                <Link to={item.path} className={style['breadcrumbs__link']}>
                                    {item.label}
                                </Link>
                            ) : item.onClick ? (
                                <button type="button" onClick={item.onClick} className={style['breadcrumbs__link']}>
                                    {item.label}
                                </button>
                            ) : (
                                <span className={style['breadcrumbs__current']} aria-current={isLast ? "page" : undefined}>
                                    {item.label}
                                </span>
                            )}

                            {!isLast && (
                                <FaChevronRight className={style['breadcrumbs__separator']} />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
