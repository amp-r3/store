import { ReactNode } from 'react';
import style from './info-banner.module.scss';

export interface InfoBannerItem {
  icon: ReactNode;
  text: string;
}

export interface InfoBannerProps {
  icon: ReactNode;
  title: string;
  description: string;
  details: InfoBannerItem[];
}

export const InfoBanner = ({ icon, title, description, details }: InfoBannerProps) => (
  <div className={style['info-banner']}>
    <div className={style['info-banner__icon-wrap']}>{icon}</div>
    <div className={style['info-banner__body']}>
      <span className={style['info-banner__title']}>{title}</span>
      <p className={style['info-banner__description']}>{description}</p>
      <ul className={style['info-banner__details']}>
        {details.map((item, index) => (
          <li key={index}>
            {item.icon}
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
