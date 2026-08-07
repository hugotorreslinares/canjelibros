export const primaryBtn =
  "bg-[#0088b0] text-white border-none rounded-[2px] px-[26px] py-[13px] text-[18px] transition-colors hover:bg-[#1186ac] active:bg-[#006786] disabled:opacity-60 disabled:pointer-events-none";

export const outlineBtn =
  "bg-transparent text-[#201e1d] border border-[#201e1d] rounded-[2px] px-[22px] py-[13px] text-[17px] transition-colors hover:bg-[#eae7e7] disabled:opacity-60 disabled:pointer-events-none";

export const linkBtn = "bg-transparent border-none p-0 text-[#006786] text-[17px] hover:text-[#d6006c] transition-colors";

export const sectionLabel = "text-[12px] tracking-[.18em] uppercase text-[#605d5d]";

export const input =
  "border border-[#201e1d]/35 rounded-[2px] bg-[#f8f4f4] px-[14px] py-[12px] text-[18px] text-[#201e1d] w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0088b0] focus-visible:outline-offset-2 placeholder:text-[#7d7979]";

export const chip = (active: boolean) =>
  active
    ? "border border-[#0088b0] bg-[#cbeeff] text-[#004961] rounded-[2px] px-[15px] py-[8px] text-[16px]"
    : "border border-[#201e1d]/30 bg-transparent text-[#444141] rounded-[2px] px-[15px] py-[8px] text-[16px]";

export const modalOverlay =
  "fixed inset-0 z-50 grid place-items-center bg-[#201e1d]/42 p-[30px]";

export const modalPanel =
  "w-full bg-[#f3f2f2] rounded-[2px] shadow-[0_12px_32px_rgba(45,43,43,.22)] max-h-[88vh] overflow-auto";

export const smallOutlineBtn =
  "bg-transparent text-[#201e1d] border border-[#201e1d] rounded-[2px] px-[16px] py-[8px] text-[15px] transition-colors hover:bg-[#eae7e7]";

export const smallPrimaryBtn =
  "bg-[#0088b0] text-white border-none rounded-[2px] px-[16px] py-[8px] text-[15px] transition-colors hover:bg-[#1186ac] active:bg-[#006786]";

export const tagPill = "text-[13px] px-[8px] py-[2px] rounded-[2px] bg-[#cbeeff] text-[#004961]";
export const condPill = "text-[13px] px-[8px] py-[2px] rounded-[2px] border border-[#201e1d]/30 text-[#444141]";
export const divider = "border-t border-[#201e1d]/16";
