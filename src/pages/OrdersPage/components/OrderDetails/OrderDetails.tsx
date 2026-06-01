import { useMediaQuery } from "@/hooks"
import { FC } from "react";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer/OrderDetailsDrawer";
import { OrderDetailsCard } from "./OrderDetailsCard/OrderDetailsCard";
import { EnrichedOrderItem, Order } from "@/types/order";

export interface OrderDetailsProps {
    open: boolean;
    order: Order;
    isFetching: boolean;
    items: EnrichedOrderItem[];
    isItemsLoading: boolean;
    isItemsFetching: boolean;
    goodsTotal: number;
    formatOrderDate(date: string): string;
    onOpenChange(): void;
}



export const OrderDetails: FC<OrderDetailsProps> = ({
    order,
    open,
    items,
    goodsTotal,
    isFetching,
    isItemsFetching,
    isItemsLoading,
    formatOrderDate,
    onOpenChange
}) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    return isMobile ? <OrderDetailsDrawer
        open={open}
        onOpenChange={onOpenChange}
        order={order}
        isFetching={isFetching}
        items={items}
        isItemsFetching={isItemsFetching}
        isItemsLoading={isItemsLoading}
        goodsTotal={goodsTotal}
        formatOrderDate={formatOrderDate} /> :
        <OrderDetailsCard
            order={order}
            isFetching={isFetching}
            items={items}
            isItemsFetching={isItemsFetching}
            isItemsLoading={isItemsLoading}
            goodsTotal={goodsTotal}
            formatOrderDate={formatOrderDate} />

}