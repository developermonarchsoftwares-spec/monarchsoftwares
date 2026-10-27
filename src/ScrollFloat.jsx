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
    const words = text.split(' ');
    return words.map((word, wordIdx) => (
      <React.Fragment key={wordIdx}>
        <span className="scroll-float-word">
          {word.split('').map((char, charIdx) => (
            <span className="char" key={charIdx}>
              {char}
            </span>
          ))}
        </span>
        {wordIdx < words.length - 1 && ' '}
      </React.Fragment>
    ));
  }, [children]);

  return (
    <Component ref={ref} className={`scroll-float ${containerClassName}`}>
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </Component>
  );
});

export default ScrollFloat;
