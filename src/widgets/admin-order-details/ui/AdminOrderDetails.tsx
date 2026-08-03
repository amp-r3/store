import { FC, useMemo } from "react";
import { AdminOrderDetailsDrawer } from "./AdminOrderDetailsDrawer/AdminOrderDetailsDrawer";
import { EnrichedOrderItem, Order } from "@/entities/order";
import { useMediaQuery } from "@/shared/lib/hooks";

export interface AdminOrderDetailsProps {
    open: boolean;
    order: Order;
    isFetching: boolean;
    items: EnrichedOrderItem[];
    isItemsLoading: boolean;
    isItemsFetching: boolean;
    onOpenChange(): void;
}

export const AdminOrderDetails: FC<AdminOrderDetailsProps> = (props) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const direction = isMobile ? 'bottom' : 'right';

    // Goods subtotal isn't stored directly — same derivation the customer
    // side uses (see UserOrdersPage): total minus the two add-ons that make
    // it up.
    const goodsTotal = useMemo(
        () => Number(props.order.totalAmount) - Number(props.order.deliveryCost) - Number(props.order.paymentFee),
        [props.order]
    );

    return <AdminOrderDetailsDrawer key={direction} direction={direction} goodsTotal={goodsTotal} {...props} />;
};
