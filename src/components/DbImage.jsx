import React, { useState, useEffect } from 'react';
import { getAsset } from '../utils/db';

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80';

function DbImage({ src, alt, style, className, loading = 'lazy' }) {
  const [displayUrl, setDisplayUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    let createdUrl = null;

    if (!src) {
      setDisplayUrl(DEFAULT_PLACEHOLDER);
      return;
    }

    if (src.startsWith('indexeddb:')) {
      const key = src.replace('indexeddb:', '');
      getAsset(key).then(blob => {
        if (isMounted) {
          if (blob) {
            createdUrl = URL.createObjectURL(blob);
            setDisplayUrl(createdUrl);
          } else {
            setDisplayUrl(DEFAULT_PLACEHOLDER);
          }
        }
      }).catch(() => {
        if (isMounted) {
          setDisplayUrl(DEFAULT_PLACEHOLDER);
        }
      });
    } else {
      setDisplayUrl(src);
    }

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [src]);

  return (
    <img 
      src={displayUrl || DEFAULT_PLACEHOLDER} 
      alt={alt || '이미지'} 
      style={style} 
      className={className} 
      loading={loading}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_PLACEHOLDER;
      }}
    />
  );
}

export default DbImage;
