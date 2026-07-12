import { useState, useRef, useEffect, ReactNode } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import style from './expandable-content.module.scss';
import { useHaptics } from "@/shared/lib/hooks";

interface ExpandableContentProps {
  children: ReactNode;
  maxHeight?: number;
  className?: string;
  /** Disable collapse/expand behavior above this viewport width (px) */
  disableAbove?: number;
}

export const ExpandableContent = ({
  children,
  maxHeight = 120,
  className = '',
  disableAbove,
}: ExpandableContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { light } = useHaptics();

  useEffect(() => {
    if (disableAbove === undefined) return;

    const mql = window.matchMedia(`(min-width: ${disableAbove + 1}px)`);
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDisabled(e.matches);
    };

    handleChange(mql);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [disableAbove]);

  useEffect(() => {
    if (contentRef.current && !isDisabled) {
      setShouldShowButton(contentRef.current.scrollHeight > maxHeight);
    } else {
      setShouldShowButton(false);
    }
  }, [children, maxHeight, isDisabled]);

  const toggleExpand = () => {
    light();
    setIsExpanded(!isExpanded);
  };

  const containerStyle = isDisabled
    ? undefined
    : { maxHeight: isExpanded ? `${contentRef.current?.scrollHeight}px` : `${maxHeight}px` };

  return (
    <div className={`${style['expandable-container']} ${className}`}>
      <div
        ref={contentRef}
        className={`${style['content']} ${!isDisabled && !isExpanded && shouldShowButton ? style['content--collapsed'] : ''}`}
        style={containerStyle}
      >
        {children}
      </div>

      {shouldShowButton && (
        <button
          type="button"
          className={style['toggle-btn']}
          onClick={toggleExpand}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              <span>Show less</span>
              <FaChevronUp className={style['icon']} />
            </>
          ) : (
            <>
              <span>Show more</span>
              <FaChevronDown className={style['icon']} />
            </>
          )}
        </button>
      )}
    </div>
  );
};
