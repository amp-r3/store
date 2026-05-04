import { ProductCard } from "@/components/products"
import { useWishlistDetails } from "@/hooks"
import { useNavigate } from "react-router"
import { ErrorView } from "@/components/common"
import { WishlistEmpty } from "@/components/common/WishlistEmpty/WishlistEmpty"
import { BackButton } from "@/components/common/BackButton/BackButton"
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
        isEmpty ? <WishlistEmpty /> :
          <>
            <h1>Your Favorites</h1>
            <div className={`content ${isFetching && !isLoading ? 'fetching-state' : ''}`}>

              {
                wishlistItems.map((item, index) => (
                  isLoading ? <ProductCardSkeleton key={item.id}/> :
                    <ProductCard
                      key={item.id}
                      product={wishlistDetails[index]}
                      priority={index < 8}
                    />
                ))
              }
            </div>
          </>
      }
    </main>
  )
}