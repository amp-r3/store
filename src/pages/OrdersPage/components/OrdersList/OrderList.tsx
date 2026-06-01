import { useMediaQuery } from "@/hooks"
import { OrdersListPagination } from './OrdersListPagination/OrdersListPagination'
import { OrdersListScroll } from "./OrdersListScroll/OrdersListScroll"
import { Order } from "@/types/order";
import { FC } from "react";

export interface OrdersListProps {
    orders: Order[];
    selectedOrderId: string;
    formatOrderDate(dateStr: string): string;
    onCardClick(id: string): void;
}

export const OrdersList: FC<OrdersListProps> = (props) => {
    const isMobile = useMediaQuery('(max-width: 768px)')
    return isMobile ? <OrdersListPagination {...props} /> : <OrdersListScroll {...props} />;
}