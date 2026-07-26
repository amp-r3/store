import { FormField, MaskedFormField } from "@/shared/ui"
import style from './checkout-shipping.module.scss'
import { Controller, useFormContext } from "react-hook-form";
import { CheckoutFormValues } from "@/features/checkout-process/model/checkoutMasterSchema";
import { useCheckoutContext } from "@/features/checkout-process/model/CheckoutContext";
import { getPostcodeMask } from "@/shared/config";
import { PICKUP_BANNER } from "@/entities/order";
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
        <div className={style['shipping__group']} role="radiogroup" aria-label="Delivery Method">
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
      </div>

      <div className={style['shipping__wrapper']}>
        {
          !isShippingRequired ?
            <div className={style['shipping__pickup-banner']}>
              <div className={style['shipping__pickup-banner__icon-wrap']}>
                {PICKUP_BANNER.icon}
              </div>
              <div className={style['shipping__pickup-banner__body']}>
                <span className={style['shipping__pickup-banner__title']}>{PICKUP_BANNER.title}</span>
                <p className={style['shipping__pickup-banner__description']}>
                  {PICKUP_BANNER.description}
                </p>
                <ul className={style['shipping__pickup-banner__details']}>
                  {PICKUP_BANNER.details.map((item, index) => (
                    <li key={index}>
                      {item.icon}
                      {item.text}
                    </li>
                  ))}
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