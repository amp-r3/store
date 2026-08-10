import { useState, useRef, useEffect } from 'react';
import style from './share-copy-btn.module.scss';
import { FaShare, FaCopy, FaRegSquareCheck } from 'react-icons/fa6';
import { useMediaQuery } from '@/shared/lib/hooks';

export const ShareCopyBtn = () => {
  const isMobile = useMediaQuery('(pointer: coarse)');

  // navigator.share isn't queried during render (it would run at prerender
  // time for /product/[id]'s ISR build and always disagree with the client's
  // first paint) — resolved once after mount instead.
  const [hasShareAPI, setHasShareAPI] = useState(false);

  const isSharePossible = hasShareAPI && isMobile;

  const [success, setSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHasShareAPI(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

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
  const ariaLabel = isSharePossible ? 'Share link' : 'Copy link';

  return (
    <button
      className={style['share-copy-btn']}
      onClick={shareContent}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className={style['share-copy-btn__icon']}>{success ? <FaRegSquareCheck /> : icon}</span>
    </button>
  );
};
