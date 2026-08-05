import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquareWarning } from 'lucide-react';
import styles from './PromptModal.module.css';

export default function PromptModal({ title, description, placeholder, onConfirm, onCancel }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => { 
      if (e.key === 'Escape') onCancel() 
      if (e.key === 'Enter') onConfirm(value)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, onConfirm, value])

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><MessageSquareWarning size={16} /></div>
            <h2>{title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onCancel}><X size={18} /></button>
        </div>
        <div className={styles.body}>
          <p>{description}</p>
          <input 
            ref={inputRef}
            type="text" 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder || 'Type here...'}
            className={styles.input}
          />
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={() => onConfirm(value)}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
