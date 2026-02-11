import { toast } from "sonner"

export const showToast = {
  success: (title, description) =>
    toast.success(title, {
      description,
    }),

  error: (title, description) =>
    toast.error(title, {
      description,
    }),

  info: (title, description) =>
    toast.info(title, {
      description,
    }),

  warning: (title, description) =>
    toast.warning(title, {
      description,
    }),

  loading: (title) =>
    toast.loading(title),
}
