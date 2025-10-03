import { Link, useNavigate, useParams } from 'react-router-dom';
import style from './productPage.module.scss';
import { useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import Loader from '../../components/ui/Loader/Loader';
import ErrorView from '../ErrorView/ErrorView';
import { FaStar, FaShoppingCart, FaChevronLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { getProductsById } from '../../store/features/productsSlice';

const ProductPage = () => {
    const { products, status } = useSelector((state) => state.products);
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const product = useMemo(() => {
        if (!products) {
            return null
        }
        const productsArr = Object.values(products);
        return productsArr.find((elem) => elem.id === Number(id));
    }, [ products, id])

    useEffect(() => {
        if (product) {
            return;
        }

        if (status === 'succeeded' && !product) {
            navigate('/404', { replace: true });
            return;
        }

        if (!product && status !== 'loading') {
            dispatch(getProductsById(id))
        }
    }, [product, navigate, status, dispatch, id]);


    if (status === 'loading') {
        return <Loader />;
    }

    if (status === 'failed') {
        return <ErrorView />;
    }

    if (status === 'succeeded' && product) {
        const { id, title, price, description, category, thumbnail, rating, reviews } = product;

        return (
            <main className={style.productPage}>
                <div className={style.container} key={id}>
                    <div className={style.backLinkWrapper}>
                        <Link to="/" className={style.backLink}>
                            <FaChevronLeft size={14} />
                            <span>Back to catalog</span>
                        </Link>
                    </div>

                    <div className={style.productLayout}>
                        <div className={style.imageColumn}>
                            <div className={style.imageWrapper}>
                                <img src={thumbnail} alt={title} className={style.productImage} />
                            </div>
                        </div>

                        <div className={style.detailsColumn}>
                            <span className={style.category}>{category}</span>
                            <h1 className={style.title}>{title}</h1>

                            <div className={style.rating}>
                                <span className={style.ratingValue}>{rating}</span>
                                <FaStar />
                                <a href="#reviews" className={style.ratingCount}>({reviews.length} reviews)</a>
                            </div>

                            <p className={style.description}>{description}</p>

                            <div className={style.purchaseBox}>
                                <p className={style.price}>${price}</p>
                                <button className={style.addToCartButton}>
                                    <FaShoppingCart size={20} />
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return <Loader />;
};

export default ProductPage;