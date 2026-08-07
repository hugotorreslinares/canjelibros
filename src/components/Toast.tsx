interface ToastProps {
  visible: boolean;
  message: string | null;
}

export function Toast({ visible, message }: ToastProps) {
  if (!visible) return null;
  return (
    <div className="fixed left-1/2 bottom-[30px] -translate-x-1/2 bg-[#201e1d] text-[#f8f4f4] rounded-[2px] px-[24px] py-[14px] text-[17px] shadow-[0_12px_32px_rgba(45,43,43,.22)] z-40">
      {message}
    </div>
  );
}
