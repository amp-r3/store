import Skeleton from "react-loading-skeleton";
import styles from "./quick-buy-button.module.scss";

interface QuickBuyButtonSkeletonProps {
  className?: string;
}

export const QuickBuyButtonSkeleton = ({ className = "" }: QuickBuyButtonSkeletonProps) => {
  return (
    <div
      className={`${styles.button} ${className}`}
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