import { FormField, MaskedFormField } from "@/shared/ui"
import style from './checkout-shipping.module.scss'
import { Controller, useFormContext } from "react-hook-form";
import { CheckoutFormValues } from "@/features/checkout-process/model/checkoutMasterSchema";
import { LuHouse, LuClock, LuPackageOpen, LuMapPin } from "react-icons/lu";
import { useCheckoutContext } from "@/features/checkout-process/model/CheckoutContext";
import { getPostcodeMask } from "@/shared/config";
import { DeliveryOption } from "./DeliveryOption/DeliveryOption";
import { DeliveryOptionSkeleton } from "./DeliveryOption/DeliveryOptionSkeleton";

export const CheckoutShipping = () => {
  const { register, control, watch, formState: { errors } } = useFormContext<CheckoutFormValues>();
  const {
    deliveryMethods, selectedDelivery, isDeliveryLoading, isShippingRequired, totals, selectDelivery,
    hasPreviousAddress, showPreviousAddressChip, applyPreviousAddress,
  } = useCheckoutContext();
  const country = watch('country');

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
          isDeliveryLoading ? Array.from({ length: 3 }).map((_, index) => (
            <DeliveryOptionSkeleton key={`skeleton-mock-${index}`} />
          )) :
            deliveryMethods?.map(opt => {
              const isSelected = selectedDelivery?.id === opt.id;
              return (
                <DeliveryOption
                  handleSelect={selectDelivery}
                  isSelected={isSelected}
                  cartTotal={totals.total}
                  option={opt}
                  key={opt.id}
                />
              )
            })
        }
      </div>

      <div className={style['shipping__wrapper']}>
        {
          !isShippingRequired ?
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
              <div className={style['shipping__header']}>
                <h2 className={style['shipping__title']}>Shipping details</h2>
                {showPreviousAddressChip && hasPreviousAddress && (
                  <button type="button" className={style['shipping__prefill']} onClick={applyPreviousAddress}>
                    Use my previous address
                  </button>
                )}
              </div>
              <div className={style['shipping__row']}>
                <FormField
                  label="Country"
                  placeholder="United States"
                  autoComplete="country-name"
                  error={errors.country?.message}
                  {...register('country')}
                />
                <FormField
                  label="City"
                  placeholder="New York"
                  autoComplete="address-level2"
                  error={errors.city?.message}
                  {...register('city')}
                />
              </div>
              <FormField
                label="Street Address"
                placeholder="123 Main Street"
                autoComplete="address-line1"
                error={errors.street?.message}
                {...register('street')}
              />
              <div className={style['shipping__row']}>
                <FormField
                  label="House number"
                  placeholder="67"
                  autoComplete="address-line2"
                  error={errors.housenumber?.message}
                  {...register('housenumber')}
                />
                <Controller
                  name="postcode"
                  control={control}
                  render={({ field }) => (
                    <MaskedFormField
                      label="ZIP / Postal Code"
                      placeholder="10001"
                      maskOptions={getPostcodeMask(country)}
                      value={field.value ?? ''}
                      onAccept={field.onChange}
                      onBlur={field.onBlur}
                      inputMode="text"
                      autoComplete="postal-code"
                      error={errors.postcode?.message}
                    />
                  )}
                />
              </div>
            </>
        }
      </div>
    </section>
  )
}