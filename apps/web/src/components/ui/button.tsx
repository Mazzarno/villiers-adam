import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 ease-organic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-organic',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // Nouveau variant organique
        organic: [
          'bg-villiers-gold text-villiers-blue font-medium',
          'rounded-organic',
          'hover:bg-villiers-gold-soft hover:scale-[1.02]',
          'hover:shadow-organic-hover',
          'active:scale-[0.98]',
          'focus-visible:ring-villiers-gold',
        ].join(' '),
        // Variant organique outline
        'organic-outline': [
          'border-2 border-villiers-blue/20 bg-transparent text-villiers-blue',
          'rounded-organic',
          'hover:border-villiers-gold hover:bg-villiers-gold/5',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:ring-villiers-gold',
        ].join(' '),
        // Variant pour le hero (blanc)
        'organic-white': [
          'border-2 border-white/30 bg-transparent text-white',
          'rounded-organic backdrop-blur-sm',
          'hover:bg-white/10 hover:border-white/50',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:ring-white',
        ].join(' '),
      },
      size: {
        default: 'h-10 px-4 py-2 rounded-md',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-14 rounded-md px-10 text-base',
        icon: 'h-11 w-11 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
