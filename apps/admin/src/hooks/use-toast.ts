import * as React from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'CLEAR_TOASTS' };

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };
    case 'CLEAR_TOASTS':
      return {
        ...state,
        toasts: [],
      };
    default:
      return state;
  }
};

let toastCount = 0;

export function useToast() {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] });

  const toast = React.useCallback(
    ({
      title,
      description,
      type,
      variant,
    }: {
      title?: string;
      description?: string;
      type?: ToastType;
      variant?: 'default' | 'destructive';
    }) => {
      const id = `toast-${++toastCount}`;
      // Map variant to type for compatibility
      const toastType = variant === 'destructive' ? 'error' : type || 'default';
      dispatch({ type: 'ADD_TOAST', toast: { id, title, description, type: toastType } });

      // Auto-remove after 5 seconds
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, 5000);

      return id;
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const clearAll = React.useCallback(() => {
    dispatch({ type: 'CLEAR_TOASTS' });
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss,
    clearAll,
  };
}
