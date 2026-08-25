interface BookCoverProps {
  cover: string | null;
  plate: string;
  title: string;
  className: string;
  textClassName: string;
}

// One cover renderer for every view: a reader's photo when there is one, the typographic
// plate otherwise. Covers are data URLs (see lib/image.ts), so a plain <img> is right —
// next/image would only add a loader in front of bytes that are already in memory.
export function BookCover({ cover, plate, title, className, textClassName }: BookCoverProps) {
  if (cover) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={cover} alt={`Portada de ${title}`} className={`${className} object-cover bg-[#eae7e7]`} />
    );
  }
  return (
    <div
      style={{ background: plate }}
      className={`${className} ${textClassName} flex items-end text-[#f8f4f4] overflow-hidden`}
    >
      {title}
    </div>
  );
}
