import { useNavigate } from 'react-router'
import style from './noResults.module.scss'
const NoResults = () => {
  const navigate = useNavigate()
  return (
    <div className={style.noResults}>
      <h2 className={style.noResults__title}>No results found</h2>
      <p className={style.noResults__desc}>Try changing your search query.</p>
      <button onClick={() => { navigate('/', { replace: true }); window.location.reload() }} className={style.noResults__btn}>Go to catalog</button>
    </div>
  )
}

export default NoResults