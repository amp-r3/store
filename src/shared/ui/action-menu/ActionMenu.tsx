import { ReactNode, useState } from 'react';
import { DropdownMenu } from 'radix-ui';
import { Link } from 'react-router';
import { LuEllipsisVertical } from 'react-icons/lu';

import { useHaptics } from '@/shared/lib/hooks';
import { IconButton } from '../icon-button/IconButton';
import style from './action-menu.module.scss';

const MODAL_ROOT = document.getElementById('modal-root')!;

export interface ActionMenuItem {
    key: string;
    label: string;
    icon?: ReactNode;
    danger?: boolean;
    disabled?: boolean;
    to?: string;
    onSelect?: () => void;
}

export interface ActionMenuProps {
    label: string;
    items: ActionMenuItem[];
    align?: 'start' | 'end';
    icon?: ReactNode;
}

export const ActionMenu = ({ label, items, align = 'end', icon }: ActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { soft } = useHaptics();

    const handleOpenChange = (openState: boolean) => {
        if (openState) soft();
        setIsOpen(openState);
    };

    return (
        <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenu.Trigger asChild>
                <IconButton aria-label={label} isActive={isOpen}>
                    {icon ?? <LuEllipsisVertical aria-hidden="true" />}
                </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal container={MODAL_ROOT}>
                <DropdownMenu.Content className={style['action-menu__content']} sideOffset={8} align={align}>
                    {items.map((item) => {
                        const itemClassName = [style['action-menu__item'], item.danger ? style['action-menu__item--danger'] : '']
                            .filter(Boolean)
                            .join(' ');

                        if (item.to) {
                            return (
                                <DropdownMenu.Item key={item.key} asChild disabled={item.disabled} className={itemClassName}>
                                    <Link to={item.to}>
                                        {item.icon && (
                                            <span className={style['action-menu__icon']} aria-hidden="true">
                                                {item.icon}
                                            </span>
                                        )}
                                        {item.label}
                                    </Link>
                                </DropdownMenu.Item>
                            );
                        }

                        return (
                            <DropdownMenu.Item
                                key={item.key}
                                disabled={item.disabled}
                                className={itemClassName}
                                onSelect={item.onSelect}
                            >
                                {item.icon && (
                                    <span className={style['action-menu__icon']} aria-hidden="true">
                                        {item.icon}
                                    </span>
                                )}
                                {item.label}
                            </DropdownMenu.Item>
                        );
                    })}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
