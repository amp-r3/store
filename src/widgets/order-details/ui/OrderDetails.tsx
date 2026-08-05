import { FC } from "react";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer/OrderDetailsDrawer";
import { EnrichedOrderItem, Order, useGetOrderStatusEventsQuery } from "@/entities/order";
import { CartProduct } from "@/entities/cart";
import { useMediaQuery } from "@/shared/lib/hooks";

export interface OrderDetailsProps {
    open: boolean;
    order: Order;
    isFetching: boolean;
    items: EnrichedOrderItem[];
    orderCartProduct: CartProduct[];
    isItemsLoading: boolean;
    isItemsFetching: boolean;
    goodsTotal: number;
    formatOrderDate(date: string): string;
    onOpenChange(): void;
    onRateClick(): void;
}

export const OrderDetails: FC<OrderDetailsProps> = (props) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const direction = isMobile ? 'bottom' : 'right';

    // Fetched here, not inside OrderDetailsDrawer — the drawer remounts on
    // every direction change (key={direction}), which would otherwise refire
    // this query for no reason.
    const { data: events = [], isLoading: isEventsLoading } = useGetOrderStatusEventsQuery(
        props.order.id,
        { skip: !props.open },
    );

    return (
        <OrderDetailsDrawer
            key={direction}
            direction={direction}
            events={events}
            isEventsLoading={isEventsLoading}
            {...props}
        />
    );
};
