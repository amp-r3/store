import { FormField } from "@/components/common"
import style from './checkout-shipping.module.scss'
import { FC } from "react"
import { useFormContext } from "react-hook-form";
import { CheckoutFormValues } from "@/schemas/checkoutMasterSchema";
import { LuHouse, LuClock, LuPackageOpen, LuMapPin } from "react-icons/lu";
import { DeliveryMethod, DeliveryOptions } from "@/types/checkout";
import { DeliveryOption } from "./DeliveryOption/DeliveryOption";
import { DeliveryOptionSkeleton } from "./DeliveryOption/DeliveryOptionSkeleton";


interface CheckoutShipping {
  isLoading: boolean;
  selectedDelivery: DeliveryMethod;
  deliveryOptions: DeliveryMethod[];
  isShippingRequiered: boolean;
  handleSelect(id: string, name: DeliveryOptions): void;
}

export const CheckoutShipping: FC<CheckoutShipping> = ({ deliveryOptions, isLoading, selectedDelivery, handleSelect, isShippingRequiered }) => {
  const { register, formState: { errors } } = useFormContext<CheckoutFormValues>();

  return (
    <section className={style['shipping']}>
      <div className={style['shipping__wrapper']}>
        {errors.deliveryMethodId && (
          <div className={style['shipping__delivery-message']} role="alert">
            {errors.deliveryMethodId.message}
          </div>
        )}
        <h2 className={style['shipping__title']}>Delivery Method</h2>
        {
          isLoading ? Array.from({ length: 3 }).map((_, index) => (
            <DeliveryOptionSkeleton key={`skeleton-mock-${index}`} />
          )) :
            deliveryOptions.map(opt => {
              const isSelected = selectedDelivery?.id === opt.id;
              return (
                <DeliveryOption handleSelect={handleSelect} isSelected={isSelected} option={opt} key={opt.id} />
              )
            })
        }
      </div>

      <div className={style['shipping__wrapper']}>
        {
          !isShippingRequiered ?
            <div className={style['shipping__pickup-banner']}>
              <div className={style['shipping__pickup-banner__icon-wrap']}>
                <LuHouse aria-hidden="true" />
              </div>
              <div className={style['shipping__pickup-banner__body']}>
                <span className={style['shipping__pickup-banner__title']}>Pick up at a nearby location</span>
                <p className={style['shipping__pickup-banner__description']}>
                  Your order will be ready for pickup at the nearest collection point. We'll send you a notification with the exact address and a confirmation code once your order is prepared.
                </p>
                <ul className={style['shipping__pickup-banner__details']}>
                  <li>
                    <LuClock aria-hidden="true" />
                    Ready within 2–4 hours after payment
                  </li>
                  <li>
                    <LuPackageOpen aria-hidden="true" />
                    Bring a valid ID and your confirmation code
                  </li>
                  <li>
                    <LuMapPin aria-hidden="true" />
                    The pickup address will be confirmed via email
                  </li>
                </ul>
              </div>
            </div>
            :
            <>
              <h2 className={style['shipping__title']}>Shipping details </h2>
              <div className={style['shipping__row']}>
                <FormField
                  label="Country"
                  placeholder="United States"
                  error={errors.country?.message}
                  {...register('country')}
                />
                <FormField
                  label="City"
                  placeholder="New York"
                  error={errors.city?.message}
                  {...register('city')}
                />
              </div>
              <FormField
                label="Street Address"
                placeholder="123 Main Street"
                error={errors.street?.message}
                {...register('street')}
              />
              <div className={style['shipping__row']}>
                <FormField
                  label="House number"
                  placeholder="67"
                  error={errors.housenumber?.message}
                  {...register('housenumber')}
                />
                <FormField
                  label="ZIP / Postal Code"
                  placeholder="10001"
                  error={errors.postcode?.message}
                  {...register('postcode')}
                />
              </div>
            </>
        }
      </div>
    </section>
  )
}