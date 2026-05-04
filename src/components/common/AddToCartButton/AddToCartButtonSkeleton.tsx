import Skeleton from "react-loading-skeleton";

export const AddToCartButtonSkeleton = ({ size = 'large' }: { size?: 'small' | 'large' }) => {
  const isSmall = size === 'small';

  return (
    <Skeleton
      height={isSmall ? 40 : 54}
      borderRadius={isSmall ? 12 : 18}
    />
  );
};