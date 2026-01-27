'use client';

import { useEffect, useState } from 'react';

let lockCount = 0;
let savedOverflow = '';
let savedPaddingRight = '';

const lockBodyScroll = () => {
  if (lockCount === 0) {
    const currentOverflow = document.body.style.overflow;
    // Only save if it's not already hidden (e.g. by MUI)
    if (currentOverflow !== 'hidden') {
      savedOverflow = currentOverflow;
      savedPaddingRight = document.body.style.paddingRight;
    }
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0 && currentOverflow !== 'hidden') {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount += 1;
};

const unlockBodyScroll = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow;
    document.body.style.paddingRight = savedPaddingRight;
    // Reset saved values
    savedOverflow = '';
    savedPaddingRight = '';
  }
};

export const useLockBodyScroll = (locked: boolean, skipIfLocked = false) => {
  useEffect(() => {
    if (!locked || skipIfLocked) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [locked, skipIfLocked]);
};

export const useIsAnyModalOpen = () => {
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  useEffect(() => {
    const checkModalState = () => {
      setIsAnyModalOpen(lockCount > 0);
    };

    // Check immediately
    checkModalState();

    // Set up an interval to check for changes
    const interval = setInterval(checkModalState, 100);

    return () => clearInterval(interval);
  }, []);

  return isAnyModalOpen;
};
