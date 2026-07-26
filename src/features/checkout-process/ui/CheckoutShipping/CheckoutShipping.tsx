import { FormField, MaskedFormField, InfoBanner, Alert } from "@/shared/ui"
import style from './checkout-shipping.module.scss'
import { Controller, useFormContext } from "react-hook-form";
import { CheckoutFormValues } from "../../model/checkoutMasterSchema";
import { useCheckoutContext } from "../../model/CheckoutContext";
import { getPostcodeMask } from "@/shared/config";
import { PICKUP_BANNER } from "@/entities/order";
import { DeliveryOption, DeliveryOptionSkeleton } from "./components";

export const CheckoutShipping = () => {
  const { register, control, watch, formState: { errors } } = useFormContext<CheckoutFormValues>();
  const {
    deliveryMethods, selectedDelivery, isDeliveryLoading, isShippingRequired, totals, selectDelivery,
    hasPreviousAddress, showPreviousAddressChip, applyPreviousAddress,
  } = useCheckoutContext();
  const country = watch('country');

  return (
    <section className={style['shipping']}>
      <div className={style['shipping__group-block']}>
        {errors.deliveryMethodId && (
          <Alert variant="error">{errors.deliveryMethodId.message}</Alert>
        )}
        <h3 className={style['shipping__title']}>Delivery Method</h3>
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

      <div className={style['shipping__divider']} role="presentation" />

      <div className={style['shipping__group-block']}>
        {
          !isShippingRequired ?
            <InfoBanner {...PICKUP_BANNER} />
            :
            <>
              <div className={style['shipping__header']}>
                <h3 className={style['shipping__title']}>Shipping details</h3>
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
                      ref={field.ref}
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