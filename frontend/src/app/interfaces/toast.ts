export interface Toast {
  show: boolean;
  message?: string;
  type: 'success' | 'error' | 'info';
}
