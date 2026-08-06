import { Modal, PageLayout } from '@/shared/ui';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { TbShoppingCartCheck } from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router';
import { useAppDispatch } from '@/shared/model';
import { clearCheckout, clearCheckoutDraft } from '@/features/checkout-process';

const CONFETTI_COLORS = ['#b8a7f0', '#d9c9f0', '#ff7a60'];
// Above #modal-root's z-index (9999, see app/styles/main.scss) so the burst
// reads as sitting in front of the confirmation modal, not behind its overlay.
const CONFETTI_Z_INDEX = 10000;

const fireSideConfetti = () => {
  const defaults = {
    particleCount: 45,
    spread: 80,
    startVelocity: 35,
    ticks: 90,
    scalar: 0.85,
    colors: CONFETTI_COLORS,
    zIndex: CONFETTI_Z_INDEX,
    disableForReducedMotion: true,
  };

  confetti({ ...defaults, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...defaults, angle: 120, origin: { x: 1, y: 0.7 } });
};

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

  useEffect(() => {
    if (!orderId) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    fireSideConfetti()
  }, [orderId])

  if (!orderId) return null
  return (
    <PageLayout>
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
