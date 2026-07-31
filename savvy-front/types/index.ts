export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface LoginModalProps extends ModalProps {
  onSwitchToRegister: () => void;
}

export interface RegisterModalProps extends ModalProps {
  onSwitchToLogin: () => void;
}