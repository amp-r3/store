/** @type {import('stylelint').Config} */
const config = {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // CSS Modules: `:global()` opts a selector out of the module hash.
    // src/widgets/mobile-bar/mobile-bar.module.scss, src/widgets/navbar/navbar.module.scss
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'local'] }],

    // Strict BEM (AGENTS.md, "CSS / SCSS"): block__element--modifier. The
    // preset's kebab-only pattern rejects most of this repo's class
    // selectors — it is incompatible with BEM by construction, not a backlog.
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z][a-z0-9]*(-[a-z0-9]+)*)?(--[a-z][a-z0-9]*(-[a-z0-9]+)*)?$',
      {
        message: (s) =>
          `Expected class selector "${s}" to be BEM kebab-case (block__element--modifier)`,
      },
    ],

    // Many rgba() calls are rgba(var(--x-rgb), a), where the custom property
    // holds a comma-separated channel triplet. Modern rgb(… / …) notation
    // cannot express that and stylelint cannot autofix it; converting would
    // mean re-architecting every --*-rgb token. Legacy notation is correct here.
    'color-function-notation': null,
    'color-function-alias-notation': null,
    'alpha-value-notation': 'number',

    // AGENTS.md documents the breakpoint set in min-width/max-width terms;
    // prefix notation also keeps the Safari floor lower than range syntax.
    'media-feature-range-notation': 'prefix',

    // Manual -webkit-/-moz- prefixes here are load-bearing (backdrop-filter,
    // background-clip: text, mask-*, ::selection). These rules' autofix
    // DELETES them, and Turbopack's Autoprefixer coverage for .module.scss
    // is unverified. Re-enable only after confirming it re-adds them.
    'property-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
  },
  ignoreFiles: ['node_modules/**', '.next/**', '.next-second/**', 'out/**'],
  overrides: [
    // Pre-existing camelCase/non-standard-BEM class names, grandfathered in
    // rather than mass-renamed: fixing them means renaming the paired
    // TSX component's `style['...']` references too, with no automated
    // check catching a missed one — real regression risk for a tooling
    // change. Known, accepted gap (like checkout.draft in AGENTS.md);
    // migrate a file's classes to kebab-case/BEM when next touching it,
    // don't do it standalone. New/changed code must comply immediately.
    {
      files: [
        'src/app/layouts/MainLayout/main-layout.module.scss',
        'src/entities/cart/ui/cart-header/cart-header.module.scss',
        'src/entities/cart/ui/empty-cart/empty-cart.module.scss',
        'src/entities/notification/ui/notification-card/notification-card.module.scss',
        'src/entities/order/ui/order-card/order-card.module.scss',
        'src/entities/product/ui/product-card/product-card.module.scss',
        'src/features/admin-product-form/ui/admin-product-form.module.scss',
        'src/features/admin-product-form/ui/components/AdminProductChangesModal/admin-product-changes-modal.module.scss',
        'src/features/admin-product-form/ui/components/AdminProductImageSlot/admin-product-image-slot.module.scss',
        'src/features/admin-product-form/ui/components/AdminProductMediaFields/admin-product-media-fields.module.scss',
        'src/features/admin-product-form/ui/components/AdminProductSizesEditor/admin-product-sizes-editor.module.scss',
        'src/features/admin-product-form/ui/components/AdminProductTagsField/admin-product-tags-field.module.scss',
        'src/features/admin-product-form/ui/components/AdminStockInput/admin-stock-input.module.scss',
        'src/features/checkout-process/ui/CheckoutPayments/components/PaymentOption/payment-option.module.scss',
        'src/features/checkout-process/ui/CheckoutSection/checkout-section.module.scss',
        'src/features/nav-actions/ui/NavActions/nav-actions.module.scss',
        'src/features/product-search/ui/search-form/search-form.module.scss',
        'src/shared/ui/auth-card/auth-card.module.scss',
        'src/shared/ui/error-view/error-view.module.scss',
        'src/shared/ui/filter-panel/filter-panel.module.scss',
        'src/shared/ui/form-field/form-field.module.scss',
        'src/shared/ui/horizontal-scroll/horizontal-scroll.module.scss',
        'src/shared/ui/loader/loader.module.scss',
        'src/shared/ui/modal/modal.module.scss',
        'src/shared/ui/no-results/noResults.module.scss',
        'src/shared/ui/select/select.module.scss',
        'src/shared/ui/status-badge/status-badge.module.scss',
        'src/shared/ui/switch/switch.module.scss',
        'src/shared/ui/textarea/textarea.module.scss',
        'src/views/home-page/ui/components/PromoBanner/promo-banner.module.scss',
        'src/views/home-page/ui/components/TrustSignals/trust-signals.module.scss',
        'src/views/not-found-page/ui/page404.module.scss',
        'src/widgets/category-showcase/ui/CategoryRow/category-row.module.scss',
        'src/widgets/category-showcase/ui/category-showcase.module.scss',
        'src/widgets/deals-showcase/ui/deals-showcase.module.scss',
        'src/widgets/footer/footer.module.scss',
        'src/widgets/product-summary/ui/product-summary.module.scss',
      ],
      rules: { 'selector-class-pattern': null },
    },
  ],
};

export default config;
