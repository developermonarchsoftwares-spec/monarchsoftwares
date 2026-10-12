'use client';

import React, { useMemo, forwardRef } from 'react';
import './ScrollFloat.css';

const ScrollFloat = forwardRef(function ScrollFloat({
  children,
  containerClassName = '',
  textClassName = '',
  as: Component = 'h2'
}, ref) {
  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('').map((char, index) => (
      <span className="char" key={index}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, [children]);

  return (
    <Component ref={ref} className={`scroll-float ${containerClassName}`}>
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </Component>
  );
});

export default ScrollFloat;
