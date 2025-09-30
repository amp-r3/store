import style from './notFound.module.scss'
import { Link } from 'react-router-dom';
import { TbHome } from 'react-icons/tb';

const NotFoundPage = () => {
  return (
    <main className={style.notFoundPage}>
      <div className={style.content}>
        <h1 className={style.errorCode}>404</h1>
        <h2 className={style.title}>Page Not Found</h2>
        <p className={style.description}>
          Oops! The page you were looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className={style.homeButton}>
          <TbHome size={20} />
          <span>Go to Homepage</span>
        </Link>
      </div>
    </main>
  );
};
export default NotFoundPage;