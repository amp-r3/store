import { FC } from 'react';
import {
  FaBarcode,
  FaWeightHanging,
  FaRulerCombined,
  FaShield,
  FaTruck,
  FaRotateLeft,
} from 'react-icons/fa6';
import style from './product-specs.module.scss';

interface Dimensions {
  height: number;
  width: number;
  depth: number;
}

interface ProductSpecsProps {
  sku: string;
  dimensions: Dimensions;
  weight: number;
  warranty: string;
  shipping: string;
  returnPolicy: string;
}

interface SpecRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const SpecRow: FC<SpecRowProps> = ({ icon, label, value }) => (
  <div className={style['spec-row']}>
    <span className={style['spec-icon']}>{icon}</span>
    <span className={style['spec-label']}>{label}</span>
    <span className={style['spec-value']}>{value}</span>
  </div>
);

export const ProductSpecs: FC<ProductSpecsProps> = ({
  sku,
  dimensions,
  weight,
  warranty,
  shipping,
  returnPolicy,
}) => {
  const { width, height, depth } = dimensions;
  const dimensionsFormatted = `${width} × ${height} × ${depth} cm`;
  const weightFormatted = `${weight} g`;

  return (
    <section className={style['specs-section']}>
      <h2 className={style['specs-title']}>Specifications</h2>

      <div className={style['specs-grid']}>
        {/* Product details */}
        <div className={style['specs-group']}>
          <span className={style['specs-group-label']}>Product</span>
          <SpecRow
            icon={<FaBarcode />}
            label="SKU"
            value={sku}
          />
          <SpecRow
            icon={<FaWeightHanging />}
            label="Weight"
            value={weightFormatted}
          />
          <SpecRow
            icon={<FaRulerCombined />}
            label="Dimensions"
            value={dimensionsFormatted}
          />
        </div>

        {/* Policies */}
        <div className={style['specs-group']}>
          <span className={style['specs-group-label']}>Policies</span>
          <SpecRow
            icon={<FaShield />}
            label="Warranty"
            value={warranty}
          />
          <SpecRow
            icon={<FaTruck />}
            label="Shipping"
            value={shipping}
          />
          <SpecRow
            icon={<FaRotateLeft />}
            label="Returns"
            value={returnPolicy}
          />
        </div>
      </div>
    </section>
  );
};