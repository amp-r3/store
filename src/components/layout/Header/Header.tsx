import { Link } from 'react-router'
import { FaBoxOpen, FaUserPlus, FaArrowRightToBracket, FaUser, FaUserMinus } from 'react-icons/fa6'
import style from './header.module.scss'
import { selectIsAuth, selectUserName } from '@/store/selectors/authSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { logout } from '@/store/slices/authSlice'
import { supabase } from '@/supabase'

export const Header = () => {
  const isAuth = useAppSelector(selectIsAuth)
  const userName = useAppSelector(selectUserName)
  const dispatch = useAppDispatch()
  const handleLogout = async () => {
    dispatch(logout())
    await supabase.auth.signOut()
  }
  return (
    <header className={style.topbar}>
      <div className={style.container + " container"}>
        <div className={style.navGroup}>
          <Link to={'/'} className={style.link}>
            <FaBoxOpen className={style.icon} />
            <span>My orders</span>
          </Link>
        </div>
        {
          isAuth ?
            <div className={style.navGroup}>
              <Link to={'/user'} className={style.link}>
                <FaUser className={style.icon} />
                <span>{userName}</span>
              </Link>
              <button className={style.link} onClick={handleLogout}>
                <FaUserMinus className={style.icon} />
                <span>Log out</span>
              </button>
            </div>
            : <div className={style.navGroup}>
              <Link to={'/register'} className={style.link}>
                <FaUserPlus className={style.icon} />
                <span>Register</span>
              </Link>
              <Link to={'/login'} className={style.loginLink}>
                <FaArrowRightToBracket className={style.icon} />
                <span>Log in</span>
              </Link>
            </div>

        }
      </div>
    </header >
  )
}