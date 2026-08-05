import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquareWarning, ChevronDown } from 'lucide-react';
import styles from './PromptModal.module.css';
import { useStore, flattenNodes } from '../store/useStore';

export default function PromptModal({ title, description, placeholder, isAction, onConfirm, onCancel }) {
  const [value, setValue] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [actionDate, setActionDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const inputRef = useRef(null);
  
  const tree = useStore(s => s.tree);
  const allAdmins = tree ? flattenNodes(tree).filter(n => !n.vacant) : [];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => { 
      if (e.key === 'Escape') onCancel() 
      if (e.key === 'Enter') onConfirm(isAction ? { reason: value, adminName: selectedAdmin, date: actionDate } : value)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, onConfirm, value, isAction, selectedAdmin, actionDate])

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
          {isAction ? (
            <div className={styles.actionForm}>
              <div className={styles.formGroup}>
                <label>Reason (optional):</label>
                <input 
                  ref={inputRef}
                  type="text" 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder || 'Type here...'}
                  className={styles.input}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Action By:</label>
                  <div className={styles.customSelectContainer} tabIndex={0} onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setIsDropdownOpen(false)
                    }
                  }}>
                    <div 
                      className={`${styles.customSelect} ${isDropdownOpen ? styles.customSelectOpen : ''}`} 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className={styles.customSelectText}>{selectedAdmin || 'Console'}</span>
                      <ChevronDown size={14} className={styles.selectIcon} />
                    </div>
                    {isDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        <div 
                          className={`${styles.dropdownItem} ${!selectedAdmin ? styles.dropdownItemSelected : ''}`}
                          onClick={() => { setSelectedAdmin(''); setIsDropdownOpen(false); }}
                        >
                          -- Console / Current --
                        </div>
                        {isAction && allAdmins.map(a => (
                          <div 
                            key={a.id}
                            className={`${styles.dropdownItem} ${selectedAdmin === a.name ? styles.dropdownItemSelected : ''}`}
                            onClick={() => { setSelectedAdmin(a.name); setIsDropdownOpen(false); }}
                          >
                            {a.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Date & Time:</label>
                  <input 
                    type="datetime-local" 
                    value={actionDate}
                    onChange={e => setActionDate(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <p>{description}</p>
              <input 
                ref={inputRef}
                type="text" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder || 'Type here...'}
                className={styles.input}
              />
            </>
          )}
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={() => onConfirm(isAction ? { reason: value, adminName: selectedAdmin, date: actionDate } : value)}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
