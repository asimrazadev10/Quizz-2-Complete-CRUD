import { toast } from "sonner";

/**
 * Toast utility functions for consistent notifications
 * Styled to match the project's dark theme with purple/pink accents
 */

export const showToast = {
  success: (message, description = null) => {
    return toast.success(message, {
      description,
      duration: 3000,
      style: {
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        color: '#ffffff',
      },
    });
  },

  error: (message, description = null) => {
    return toast.error(message, {
      description,
      duration: 4000,
      style: {
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#ffffff',
      },
    });
  },

  warning: (message, description = null) => {
    return toast.warning(message, {
      description,
      duration: 3000,
      style: {
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(234, 179, 8, 0.3)',
        color: '#ffffff',
      },
    });
  },

  info: (message, description = null) => {
    return toast.info(message, {
      description,
      duration: 3000,
      style: {
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: '#ffffff',
      },
    });
  },

  loading: (message) => {
    return toast.loading(message, {
      duration: Infinity,
      style: {
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        color: '#ffffff',
      },
    });
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Processing...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong',
    });
  },
};

export default showToast;


