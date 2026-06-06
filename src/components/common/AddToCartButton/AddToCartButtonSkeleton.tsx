import Skeleton from "react-loading-skeleton";
import styles from "./add-to-cart-button.module.scss";

interface AddToCartButtonSkeletonProps {
  className?: string;
}

export const AddToCartButtonSkeleton = ({ className = "" }: AddToCartButtonSkeletonProps) => {
  return (
    <div
      className={`${styles.container} ${className}`}
      style={{
        background: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
        pointerEvents: "none",
      }}
    >
      <Skeleton
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: "var(--radius-lg, 12px)",
          display: "block",
        }}
      />
    </div>
  );
};