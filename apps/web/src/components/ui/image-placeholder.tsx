import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImagePlaceholderProps = {
  label?: string;
  className?: string;
};

export function ImagePlaceholder({ label = 'Aucune image disponible', className }: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground',
        className
      )}
    >
      <ImageIcon className="h-8 w-8 opacity-60" />
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}
