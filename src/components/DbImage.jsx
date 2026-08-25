import React, { useState, useEffect } from 'react';
import { getAsset } from '../utils/db';

function DbImage({ src, alt, style, className }) {
  const [displayUrl, setDisplayUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (!src) {
      setDisplayUrl('https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80');
      return;
    }

    if (src.startsWith('indexeddb:')) {
      const key = src.replace('indexeddb:', '');
      getAsset(key).then(blob => {
        if (isMounted) {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setDisplayUrl(url);
          } else {
            // Fallback placeholder if indexeddb asset is not found on client
            setDisplayUrl('https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80');
          }
        }
      }).catch(() => {
        if (isMounted) {
          setDisplayUrl('https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80');
        }
      });
    } else {
      setDisplayUrl(src);
    }

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <img 
      src={displayUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80'} 
      alt={alt || '이미지'} 
      style={style} 
      className={className} 
      onError={(e) => {
        // Fallback on load error
        e.target.onerror = null;
        e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80';
      }}
    />
  );
}

export default DbImage;
