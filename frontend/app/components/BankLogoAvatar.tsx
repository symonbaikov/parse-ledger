'use client';

import { resolveBankLogo } from '@bank-logos';
import React from 'react';

type Props = {
  bankName?: string | null;
  size?: number;
  className?: string;
  rounded?: boolean;
};

export function BankLogoAvatar({ bankName, size = 32, className, rounded = true }: Props) {
  const resolved = resolveBankLogo(bankName);
  const [stage, setStage] = React.useState<0 | 1 | 2>(0);

  const fallbackLetter =
    (bankName || resolved.displayName || 'B').trim().charAt(0).toUpperCase() || 'B';
  const defaultSrc = '/images/bank-logo/bank.png';
  const src = stage === 0 ? resolved.src : stage === 1 ? defaultSrc : null;

  if (src) {
    return (
      <img
        src={src}
        alt={bankName || resolved.displayName || 'Bank'}
        width={size}
        height={size}
        className={[
          rounded ? 'rounded-full' : 'rounded-lg',
          'bg-gray-100 object-contain',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onError={() => setStage(prev => (prev === 2 ? 2 : ((prev + 1) as 0 | 1 | 2)))}
      />
    );
  }

  return (
    <div
      className={[
        'flex items-center justify-center bg-gray-100 text-gray-500 font-bold',
        rounded ? 'rounded-full' : 'rounded-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.floor(size / 2.6)) }}
      aria-label={bankName || resolved.displayName || 'Bank'}
      title={bankName || resolved.displayName || 'Bank'}
    >
      {fallbackLetter}
    </div>
  );
}
