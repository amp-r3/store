import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuArrowLeft, LuCheck, LuChevronDown, LuUserRound } from 'react-icons/lu';
import { DropdownMenu } from 'radix-ui';

import { useHaptics } from '@/shared/lib/hooks';
import { getModalRoot } from '@/shared/lib';

import { ADMIN_NAV_ITEMS } from '../../config/navItems';
import { resolveActiveNavItem } from '../../lib/resolveActiveNavItem';

import style from './admin-mobile-nav.module.scss';

export const AdminMobileNav = () => {
  const { soft } = useHaptics();
  const pathname = usePathname();
  const modalRoot = getModalRoot();

  const activeItem = resolveActiveNavItem(pathname);
  const ActiveIcon = activeItem.icon;

  return (
    <div className={style['admin-mobile-nav']}>
      <div className={style['admin-mobile-nav__exit-links']}>
        <Link href="/user" className={style['admin-mobile-nav__back']} onClick={() => soft()}>
          <LuUserRound className={style['admin-mobile-nav__back-icon']} />
          <span className={style['admin-mobile-nav__back-label']}>My profile</span>
        </Link>
        <Link href="/" className={style['admin-mobile-nav__back']} onClick={() => soft()}>
          <LuArrowLeft className={style['admin-mobile-nav__back-icon']} />
          <span className={style['admin-mobile-nav__back-label']}>Back to store</span>
        </Link>
      </div>

      <DropdownMenu.Root onOpenChange={(open) => open && soft()}>
        <DropdownMenu.Trigger asChild>
          <button type="button" className={style['admin-mobile-nav__trigger']}>
            <ActiveIcon className={style['admin-mobile-nav__trigger-icon']} aria-hidden="true" />
            <span className={style['admin-mobile-nav__trigger-label']}>{activeItem.label}</span>
            <LuChevronDown
              className={style['admin-mobile-nav__trigger-chevron']}
              aria-hidden="true"
            />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal container={modalRoot}>
          <DropdownMenu.Content
            className={style['admin-mobile-nav__content']}
            sideOffset={8}
            align="start"
            aria-label="Admin sections"
          >
            {ADMIN_NAV_ITEMS.map(({ id, to, icon: Icon, label }) => {
              const isActive = id === activeItem.id;
              return (
                <DropdownMenu.Item
                  key={id}
                  asChild
                  className={`${style['admin-mobile-nav__item']} ${isActive ? style['admin-mobile-nav__item--active'] : ''}`}
                >
                  <Link href={to} replace onClick={() => soft()}>
                    <Icon className={style['admin-mobile-nav__item-icon']} aria-hidden="true" />
                    <span className={style['admin-mobile-nav__item-label']}>{label}</span>
                    {isActive && (
                      <LuCheck
                        className={style['admin-mobile-nav__item-check']}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};
