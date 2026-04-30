import { ProductCard } from "@/components/products"
import { useWishlistDetails } from "@/hooks"
import { useNavigate } from "react-router"
import { ErrorView, Loader } from "@/components/common"
import { WishlistEmpty } from "@/components/common/WishlistEmpty/WishlistEmpty"
import { BackButton } from "@/components/common/BackButton/BackButton"

export const WishListPage = () => {
  const { wishlistDetails, isEmpty, isError, isLoading, isFetching } = useWishlistDetails()
  const navigate = useNavigate()

  if (isLoading) {
    return <Loader />
  }

  if (isError) {
    return <ErrorView />
  }


  return (
    <main className="container">
      <BackButton
        onClick={() => { navigate(-1) }}
      />
      {
        isEmpty ? <WishlistEmpty /> :
          <>
            <h1>Your Favorites</h1>
            <div className='content'
              style={{ opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.2s' }}
            >
              {
                wishlistDetails.map((item, index) => (
                  <ProductCard
                    key={item.id}
                    product={item}
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