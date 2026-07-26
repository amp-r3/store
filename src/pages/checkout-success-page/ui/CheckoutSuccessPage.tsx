import { Modal, PageLayout, HOME_CRUMB } from '@/shared/ui';
import { useEffect } from 'react';
import { TbShoppingCartCheck } from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router';
import { useAppDispatch } from '@/shared/model';
import { clearCheckout, clearCheckoutDraft } from '@/features/checkout-process';

export const CheckoutSuccessPage = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const orderId = state?.orderId

  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true })
      return
    }
    // Cleared here (not right after the order is created) so the still-empty
    // checkout.items can't make CheckoutGuard bounce this route before the
    // lazy-loaded success page has actually committed and carries orderId.
    dispatch(clearCheckout())
    dispatch(clearCheckoutDraft())
  }, [orderId, navigate, dispatch])

  if (!orderId) return null
  return (
    <PageLayout breadcrumbs={[HOME_CRUMB, { label: 'Checkout' }, { label: 'Order Confirmed' }]}>
      <Modal
        isOpen={true}
        onOpenChange={() => { navigate('/', { replace: true }) }}
        title="You're all set!"
        description={`Order №${orderId} has been confirmed. You can track its status on the orders page.`}
        icon={<TbShoppingCartCheck size={50} />}
        actionLabel="My Orders"
        onAction={() => { navigate('/user/orders', { replace: true }) }}
        actionVariant='success'
      />
    </PageLayout>
  )
}