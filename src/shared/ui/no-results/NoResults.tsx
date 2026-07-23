import { useNavigate } from 'react-router'
import { TbSearchOff } from 'react-icons/tb'
import style from './noResults.module.scss'
import { useHaptics } from "@/shared/lib/hooks";

interface NoResultsProps {
  query?: string;
  description?: string;
}

export const NoResults = ({ query, description }: NoResultsProps) => {
  const navigate = useNavigate()
  const { light } = useHaptics()

  const handleReset = () => {
    light()
    navigate('/catalog', { replace: true })
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
          {description ? (
            description
          ) : query ? (
            <>
              We couldn't find any items matching <span className={style.noResults__highlight}>"{query}"</span>.
            </>
          ) : (
            'Try adjusting your search or filter settings to find what you are looking for.'
          )}
        </p>

        <button onClick={handleReset} className={style.noResults__btn}>
          Reset Filters
        </button>
      </div>
    </div>
  )
}