import { Link } from 'react-router';
import { FaUserPlus, FaArrowRightToBracket, FaUser } from 'react-icons/fa6';
import { FaGithub } from 'react-icons/fa';
import { selectIsAuth, selectUserName } from '@/entities/session';
import style from './header.module.scss';
import { useAppSelector } from "@/shared/model";

export const Header = () => {
  const isAuth = useAppSelector(selectIsAuth);
  const userName = useAppSelector(selectUserName);

  return (
    <header className={style.topbar}>
      <div className={`${style.container} container`}>
        <div className={style.navGroup}>
          <a
            href="https://github.com/amp-r3/store"
            target="_blank"
            rel="noopener noreferrer"
            className={style.ghostButton}
          >
            <FaGithub className={style.icon} />
            <span className={style.optionalText}>source code</span>
          </a>
        </div>

        <span className={style.text}>
          Portfolio site: materials are not commercial.
        </span>

        <div className={style.actionsGroup}>

          {isAuth ?
            <Link to={'/user'} className={style.primaryButton}>
              <FaUser className={style.icon} />
              <span>{userName}</span>
            </Link>
            :
            <div className={style.authButtons}>
              <Link to={'/register'} className={style.ghostButton}>
                <FaUserPlus className={style.icon} />
                <span>Sign up</span>
              </Link>
              <Link to={'/login'} className={style.primaryButton}>
                <FaArrowRightToBracket className={style.icon} />
                <span>Sign in</span>
              </Link>
            </div>
          }
        </div>
      </div>
    </header>
  );
};