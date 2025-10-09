import { Route, Routes } from 'react-router-dom'
import ProductPage from './pages/ProductPage/ProductPage'
import NotFoundPage from './pages/Page404/Page404'
import Layout from './components/layout/Layout'
import CatalogPage from './pages/CatalogPage/CatalogPage'
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CatalogPage />} />
        </Route>
          <Route path='*' element={<NotFoundPage />}></Route>
          <Route path='/404' element={<NotFoundPage />}></Route>
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </>
  )
}
export default App