import { Link } from 'react-router'
import style from './logo.module.scss'
export const Logo = () => {
  return (
    <Link to={'/'} className={style.logo} aria-label="Store">store</Link>
  )
}