import { useNavigate } from "react-router"
import { ProductCardSkeleton } from "@/entities/product"
import { BackButton, ErrorView } from "@/shared/ui";
import { useWishlistDetails } from "@/entities/wishlist";
import { ProductCard } from "@/entities/product";
import { WishlistEmpty } from "@/entities/wishlist";

export const WishListPage = () => {
  const { wishlistDetails, isEmpty, isError, isLoading, isFetching, wishlistItems } = useWishlistDetails()
  const navigate = useNavigate()

  if (isError) {
    return <ErrorView />
  }


  return (
    <main className='container'>
      <BackButton onClick={() => { navigate(-1) }} />

      <h1>Your Favorites</h1>

      {isEmpty && !isLoading ? (
        <WishlistEmpty />
      ) : (
        <div className={`content ${isFetching && !isLoading ? 'fetching-state' : ''}`}>
          {isLoading
            ? (
              isEmpty
                ? Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardSkeleton key={`skeleton-mock-${index}`} />
                ))
                : wishlistItems.map((item) => (
                  <ProductCardSkeleton key={`skeleton-${item.id}`} />
                ))
            )
            : wishlistItems.map((item, index) => (
              <ProductCard
                key={item.id}
                product={wishlistDetails[index]}
                priority={index < 8}
              />
            ))
          }
        </div>
      )}
    </main>
  )
}
