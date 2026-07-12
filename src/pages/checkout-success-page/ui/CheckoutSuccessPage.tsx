import { Modal } from '@/shared/ui';
import { useEffect } from 'react';
import { TbShoppingCartCheck } from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router';
export const CheckoutSuccessPage = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const orderId = state?.orderId

  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true })
    }
  }, [orderId, navigate])

  if (!orderId) return null
  return (
    <main className='container'>
      <Modal
        isOpen={true}
        onOpenChange={() => { navigate('/', { replace: true }) }}
        title="You're all set!"
        description={`Order №${orderId} has been confirmed. You can track its status on the orders page.`}
        icon={<TbShoppingCartCheck size={50} />}
        actionLabel="My Orders"
        onAction={() => { navigate('/orders', { replace: true }) }}
        actionVariant='success'
      />
    </main>
  )
}