import style from './loader.module.scss'
const Loader = () => {
    return (
        <div className={style.spinnerWrapper}>
            <div className={style.spinner}></div>
        </div>
    )
}

export default Loader