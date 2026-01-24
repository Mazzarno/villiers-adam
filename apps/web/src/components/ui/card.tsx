import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'organic' | 'elevated';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-card text-card-foreground',
        // Variant default
        variant === 'default' && 'rounded-lg border shadow-sm',
        // Variant organic avec border-radius asymétrique
        variant === 'organic' && [
          'rounded-organic border border-border/50',
          'transition-all duration-500 ease-organic',
          'shadow-organic',
          'hover:-translate-y-1 hover:shadow-organic-hover',
        ],
        // Variant elevated avec plus d'ombre
        variant === 'elevated' && [
          'rounded-organic-lg border border-border/30',
          'transition-all duration-500 ease-organic',
          'shadow-organic-lg',
          'hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(30,58,95,0.15)]',
        ],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl font-heading font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

// Nouveau composant CardImage pour les cards avec images
const CardImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-t-organic',
        'group-hover:after:opacity-100',
        'after:absolute after:inset-0 after:bg-gradient-to-t after:from-villiers-blue/40 after:to-transparent after:opacity-0 after:transition-opacity after:duration-500',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
CardImage.displayName = 'CardImage';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardImage };
