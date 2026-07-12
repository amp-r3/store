import { OrdersListPagination } from './OrdersListPagination/OrdersListPagination'
import { OrdersListScroll } from "./OrdersListScroll/OrdersListScroll"
import { Order } from "@/entities/order/model/types";
import { FC } from "react";

export interface OrdersListProps {
    orders: Order[];
    totalItems: number;
    selectedOrderId: string;
    currentPage: number;
    itemsPerPage: number;
    formatOrderDate(dateStr: string): string;
    onCardClick(id: string): void;
    onPageChange(newPage: number): void;
    onLoadMore(): void;
    hasMore: boolean;
    isMobile: boolean;
    isLoading: boolean;
    isFetching: boolean;
}

export const OrdersList: FC<OrdersListProps> = (props) => {
    return props.isMobile ? <OrdersListPagination {...props} /> : <OrdersListScroll {...props} />;
}