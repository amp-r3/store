import { ReactNode } from 'react';
import {
  HiOutlineUser,
  HiUser,
  HiOutlineMapPin,
  HiMapPin,
  HiOutlineCreditCard,
  HiCreditCard,
} from 'react-icons/hi2';
import {
  HiLocationMarker,
  HiCreditCard as HiCreditCardFilled,
  HiCheckCircle,
} from 'react-icons/hi';
import { StepType } from './types';
import { CheckoutFormValues } from './checkoutMasterSchema';

interface CheckoutStepConfig {
  order: string;
  label: string;
  cta: string;
  ctaIcon: ReactNode;
  icon: ReactNode;
  iconActive: ReactNode;
  fields: (keyof CheckoutFormValues)[];
}

export const CHECKOUT_STEPS: Record<StepType, CheckoutStepConfig> = {
  contacts: {
    order: '01',
    label: 'Contacts',
    cta: 'Continue to Delivery',
    ctaIcon: <HiLocationMarker />,
    icon: <HiOutlineUser />,
    iconActive: <HiUser />,
    fields: ['firstName', 'lastName', 'email', 'phone'],
  },
  delivery: {
    order: '02',
    label: 'Delivery',
    cta: 'Continue to Payment',
    ctaIcon: <HiCreditCardFilled />,
    icon: <HiOutlineMapPin />,
    iconActive: <HiMapPin />,
    fields: [
      'deliveryMethodId',
      'deliveryMethodCode',
      'country',
      'city',
      'street',
      'housenumber',
      'postcode',
    ],
  },
  payment: {
    order: '03',
    label: 'Payment',
    cta: 'Place Order',
    ctaIcon: <HiCheckCircle />,
    icon: <HiOutlineCreditCard />,
    iconActive: <HiCreditCard />,
    fields: ['paymentMethodId'],
  },
};
