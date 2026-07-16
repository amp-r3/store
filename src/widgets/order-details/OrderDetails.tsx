import { FC } from "react";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer/OrderDetailsDrawer";
import { OrderDetailsCard } from "./OrderDetailsCard/OrderDetailsCard";
import { EnrichedOrderItem, Order } from "@/entities/order";
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



export const OrderDetails: FC<OrderDetailsProps> = ({
    order,
    open,
    items,
    goodsTotal,
    isFetching,
    isItemsFetching,
    isItemsLoading,
    formatOrderDate,
    orderCartProduct,
    onOpenChange,
    onRateClick,
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
        formatOrderDate={formatOrderDate}
        orderCartProduct={orderCartProduct}
        onRateClick={onRateClick} /> :
        <OrderDetailsCard
            order={order}
            isFetching={isFetching}
            items={items}
            isItemsFetching={isItemsFetching}
            isItemsLoading={isItemsLoading}
            goodsTotal={goodsTotal}
            formatOrderDate={formatOrderDate}
            orderCartProduct={orderCartProduct}
            onRateClick={onRateClick} />

}