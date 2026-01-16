/**
 * Компонент кнопки для запуска тура
 */

'use client';

import { Button } from '@mui/material';
import { PlayCircle } from 'lucide-react';
import { useTour } from '../../hooks/useTour';

interface TourButtonProps {
  tourId: string;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function TourButton({
  tourId,
  variant = 'outlined',
  size = 'small',
  label = 'Показать тур',
  icon = <PlayCircle size={16} />,
  disabled = false,
  className = '',
}: TourButtonProps) {
  const { startTour, isActive, isCompleted } = useTour(tourId);

  const handleClick = () => {
    if (!isActive) {
      startTour();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isActive}
      startIcon={icon}
      className={className}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
      }}
    >
      {isCompleted ? 'Повторить тур' : label}
    </Button>
  );
}
