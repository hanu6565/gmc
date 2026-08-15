import React, { useState, useEffect } from 'react';
import { getAsset } from '../utils/db';

function DbImage({ src, alt, style, className }) {
  const [localUrl, setLocalUrl] = useState('');

  useEffect(() => {
    if (src && src.startsWith('indexeddb:')) {
      const key = src.replace('indexeddb:', '');
      getAsset(key).then(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setLocalUrl(url);
        }
      });
    } else {
      setLocalUrl('');
    }
  }, [src]);

  return (
    <img 
      src={localUrl || src || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80'} 
      alt={alt} 
      style={style} 
      className={className} 
    />
  );
}

export default DbImage;
