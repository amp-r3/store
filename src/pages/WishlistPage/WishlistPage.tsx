import { ProductCard } from "@/components/products"
import { useWishlistDetails } from "@/hooks"
import { useNavigate } from "react-router"
import { BackButton, ErrorView, WishlistEmpty } from "@/components/common"
import { ProductCardSkeleton } from "@/components/products/ProductCard/ProductCardSkeleton"

export const WishListPage = () => {
  const { wishlistDetails, isEmpty, isError, isLoading, isFetching, wishlistItems } = useWishlistDetails()
  const navigate = useNavigate()

  if (isError) {
    return <ErrorView />
  }


  return (
    <main className='container'>
      <BackButton
        onClick={() => { navigate(-1) }}
      />

      {
        isLoading || isFetching ? (
          isEmpty
            ? Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-mock-${index}`} />
            ))
            : wishlistItems.map((item) => (
              <ProductCardSkeleton key={`skeleton-${item.id}`} />
            ))

        ) : isEmpty ? (
          <WishlistEmpty />

        ) : (
          <>
            <h1>Your Favorites</h1>
            <div className={`content ${isFetching && !isLoading ? 'fetching-state' : ''}`}>
              {
                wishlistItems.map((item, index) => (
                  <ProductCard
                    key={item.id}
                    product={wishlistDetails[index]}
                    priority={index < 8}
                  />
                ))
              }
            </div>
          </>
        )
      }
    </main>
  )
}