import { Modal } from '@/components/common';
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
      return
    }

    window.history.replaceState({}, '')
  }, [])

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
        onAction={() => { navigate('/user', { replace: true }) }}
        actionVariant='success'
      />
    </main>
  )
}