import style from './wishlist-empty.module.scss'
import { IoIosHeartDislike } from "react-icons/io";

export const WishlistEmpty = () => {
  return (
    <div className={style['wishlist__wrapper']}>
      <div className={style['wishlist']}>
        <div className={style['wishlist__icon']}>
          <IoIosHeartDislike />
        </div>

        <h2 className={style['wishlist__title']}>
          We'll save your favorite products here.
        </h2>

        <p className={style['wishlist__desc']}>
          Click ♡ on items you usually order or want to buy later
        </p>
      </div>
    </div>
  )
}