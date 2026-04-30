import { useState, useRef, useEffect } from 'react';
import style from './share-copy-btn.module.scss';
import { FaShare, FaCopy, FaRegSquareCheck } from "react-icons/fa6";

export const ShareCopyBtn = () => {
  const hasShareAPI = !!navigator.share;

  const isMobile = typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches;

  const isSharePossible = hasShareAPI && isMobile;

  const [success, setSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSuccess = () => {
    setSuccess(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSuccess(false), 2000);
  };

  async function shareContent() {
    if (isSharePossible) {
      try {
        await navigator.share({
          url: window.location.href,
        });
        handleSuccess();
      } catch (err) {
        console.log('The user closed the Share window:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        handleSuccess();
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  }

  const icon = isSharePossible ? <FaShare /> : <FaCopy />;
  const ariaLabel = isSharePossible ? "Share link" : "Copy link";

  return (
    <button
      className={style['share-copy-btn']}
      onClick={shareContent}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className={style['share-copy-btn__icon']}>
        {success ? <FaRegSquareCheck /> : icon}
      </span>
    </button>
  );
}