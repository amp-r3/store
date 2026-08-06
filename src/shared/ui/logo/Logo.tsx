import Link from 'next/link'
import style from './logo.module.scss'
export const Logo = () => {
  return (
    <Link href={'/'} className={style.logo} aria-label="Store">store</Link>
  )
}