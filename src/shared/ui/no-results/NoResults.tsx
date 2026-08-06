import { useRouter } from 'next/navigation'
import { TbSearchOff } from 'react-icons/tb'
import style from './noResults.module.scss'
import { useHaptics } from "@/shared/lib/hooks";

interface NoResultsProps {
  query?: string;
  description?: string;
}

export const NoResults = ({ query, description }: NoResultsProps) => {
  const router = useRouter()
  const { light } = useHaptics()

  const handleReset = () => {
    light()
    router.replace('/catalog')
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
              We couldn&apos;t find any items matching <span className={style.noResults__highlight}>&quot;{query}&quot;</span>.
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