import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconElement?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  };
  className?: string;
}

/**
 * EmptyState Component
 * Generic empty state component for displaying when no content is available
 * Used across the app for consistent empty state experiences
 */
export function EmptyState({
  title,
  description,
  icon: Icon,
  iconElement,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      {/* Icon */}
      <div className="mb-6 text-muted-foreground">
        {Icon ? (
          <Icon className="h-12 w-12 mx-auto" strokeWidth={1.5} />
        ) : iconElement ? (
          iconElement
        ) : (
          <svg
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="max-w-md">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {description}
        </p>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'default'}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'outline'}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
