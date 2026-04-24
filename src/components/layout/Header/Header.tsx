import { Link } from 'react-router'
import { FaUserPlus, FaArrowRightToBracket, FaUser } from 'react-icons/fa6'
import { FaGithub } from 'react-icons/fa'
import { selectIsAuth, selectUserName } from '@/store/selectors/authSelectors'
import { useAppSelector } from '@/hooks'
import style from './header.module.scss'

export const Header = () => {
  const isAuth = useAppSelector(selectIsAuth)
  const userName = useAppSelector(selectUserName)

  return (
    <header className={style.topbar}>
      <div className={`${style.container} container`}>
        <div className={style.navGroup}>
          <a
            href="https://github.com/amp-r3/store"
            target="_blank"
            rel="noopener noreferrer"
            className={style.link}
          >
            <FaGithub className={style.icon} />
            <span>source code</span>
          </a>
        </div>

        <span className={style.text}>Portfolio site: materials are not commercial.</span>

        {isAuth ? (
          <div className={style.navGroup}>
            <Link to={'/user'} className={style.link}>
              <FaUser className={style.icon} />
              <span>{userName}</span>
            </Link>
          </div>
        ) : (
          <div className={style.navGroup}>
            <Link to={'/register'} className={style.link}>
              <FaUserPlus className={style.icon} />
              <span>Sign up</span>
            </Link>
            <Link to={'/login'} className={style.loginLink}>
              <FaArrowRightToBracket className={style.icon} />
              <span>Sign in</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}