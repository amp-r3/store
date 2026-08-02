import { FC } from 'react';
import { Drawer } from 'vaul';
import { VisuallyHidden } from 'radix-ui';
import { IoClose } from 'react-icons/io5';

import { AdminCustomerDetailsHeader, AdminCustomerDetailsBody } from '../components';
import { AdminCustomerDetailsProps } from '../AdminCustomerDetails';
import style from './admin-customer-details-drawer.module.scss';

const MODAL_ROOT = document.getElementById('modal-root')!;

type AdminCustomerDetailsDrawerProps = AdminCustomerDetailsProps & {
    direction: 'bottom' | 'right';
};

export const AdminCustomerDetailsDrawer: FC<AdminCustomerDetailsDrawerProps> = ({
    open,
    customer,
    isFetching,
    direction,
    onOpenChange,
}) => {
    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange} direction={direction}>
            <Drawer.Portal container={MODAL_ROOT}>
                <Drawer.Overlay className={style['admin-customer-drawer__overlay']} />

                <Drawer.Content
                    className={`${style['admin-customer-drawer__content']} ${style[`admin-customer-drawer__content--${direction}`]}`}
                    aria-describedby={undefined}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                    }}
                >
                    <VisuallyHidden.Root>
                        <Drawer.Title>Customer details</Drawer.Title>
                    </VisuallyHidden.Root>

                    {direction === 'bottom' && (
                        <Drawer.Handle className={style['admin-customer-drawer__handle']} />
                    )}

                    <Drawer.Close asChild>
                        <button className={style['admin-customer-drawer__close']} aria-label="Close customer details">
                            <IoClose size={20} />
                        </button>
                    </Drawer.Close>

                    <div className={style['admin-customer-drawer__layout']}>
                        <AdminCustomerDetailsHeader customer={customer} isFetching={isFetching} />
                        <AdminCustomerDetailsBody customer={customer} />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
