import { FaChevronLeft } from "react-icons/fa"
import style from './back-button.module.scss'

interface BackButtonProps {
  onClick(): void;
  label?: string;
}

export const BackButton = ({ label = 'Go back', onClick }: BackButtonProps) => {
  return (
    <button onClick={onClick} className={style['back-link']}>
      <FaChevronLeft size={12} className={style['back-icon']} />
      <span>{label}</span>
    </button>
  )
}