import { useNavigate } from 'react-router'
import { TbSearchOff } from 'react-icons/tb'
import style from './noResults.module.scss'

interface NoResultsProps {
  query?: string;
}

export const NoResults = ({ query }: NoResultsProps) => {
  const navigate = useNavigate()

  const handleReset = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className={style.wrapper}>
      <div className={style.noResults}>
        <div className={style.noResults__icon}>
          <TbSearchOff />
        </div>

        <h2 className={style.noResults__title}>
          {query ? 'No matches found' : 'No results found'}
        </h2>

        <p className={style.noResults__desc}>
          {query ? (
            <>
              We couldn't find any items matching <span className={style.noResults__highlight}>"{query}"</span>.
            </>
          ) : (
            'Try adjusting your search or filter settings to find what you are looking for.'
          )}
        </p>

        <button onClick={handleReset} className={style.noResults__btn}>
          Clear Search
        </button>
      </div>
    </div>
  )
}