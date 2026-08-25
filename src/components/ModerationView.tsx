import { chip, condPill, divider, input, linkBtn, primaryBtn, sectionLabel, smallOutlineBtn, tagPill } from "@/lib/ui";
import { BookCover } from "./BookCover";

interface ModerationBook {
  id: string;
  cover: string | null;
  t: string;
  a: string;
  cat: string;
  cond: string;
  desc: string;
  ownerName: string;
  isMine: boolean;
  reserved: boolean;
  reservedWith: string;
  plate: string;
  editing: boolean;
  edit: () => void;
  remove: () => void;
}

interface LogEntry {
  id: string;
  when: string;
  action: string;
  isDelete: boolean;
  bookTitle: string;
  ownerName: string;
  moderatorName: string;
  reason: string;
  changes: string[];
}

interface Chip {
  label: string;
  active: boolean;
  pick: () => void;
}

interface ModerationViewProps {
  allowed: boolean;
  signedIn: boolean;
  items: ModerationBook[];
  count: number;
  query: string;
  setQuery: (v: string) => void;
  form: { t: string; a: string; desc: string; cond: string; cat: string };
  setTitle: (v: string) => void;
  setAuthor: (v: string) => void;
  setDesc: (v: string) => void;
  condChips: Chip[];
  catChips: Chip[];
  cover: string | null;
  removeCover: () => void;
  reason: string;
  setReason: (v: string) => void;
  log: LogEntry[];
  logEmpty: boolean;
  save: () => void;
  cancelEdit: () => void;
  goPolicies: () => void;
}

export function ModerationView({
  allowed,
  signedIn,
  items,
  count,
  query,
  setQuery,
  form,
  setTitle,
  setAuthor,
  setDesc,
  condChips,
  catChips,
  cover,
  removeCover,
  reason,
  setReason,
  log,
  logEmpty,
  save,
  cancelEdit,
  goPolicies,
}: ModerationViewProps) {
  if (!allowed) {
    return (
      <div className="px-[24px] sm:px-[40px] pt-[34px] pb-[60px] max-w-[720px]">
        <div className={sectionLabel}>Moderación</div>
        <h1 className="text-[40px] sm:text-[52px] leading-none mt-[8px] mb-[18px]">Panel restringido</h1>
        <p className="text-[17px] leading-[1.5] text-[#444141]">
          {signedIn
            ? "Tu cuenta no tiene permisos de moderación. Si crees que debería tenerlos, escríbenos a moderacion@elcanje.co."
            : "Inicia sesión con una cuenta de moderación para revisar publicaciones reportadas."}
        </p>
        <button onClick={goPolicies} className={`${smallOutlineBtn} mt-[24px]`}>
          Ver políticas del sitio
        </button>
      </div>
    );
  }

  return (
    <div className="px-[24px] sm:px-[40px] pt-[34px] pb-[60px] max-w-[1180px]">
      <div className={sectionLabel}>Moderación</div>
      <h1 className="text-[40px] sm:text-[52px] leading-none mt-[8px] mb-0">Publicaciones de la comunidad</h1>
      <p className="text-[17px] leading-[1.5] text-[#444141] mt-[10px] max-w-[46em]">
        Edita una publicación para corregir o retirar datos que incumplan las{" "}
        <button onClick={goPolicies} className={linkBtn}>
          políticas del sitio
        </button>
        , o elimínala si el contenido no puede corregirse. Toda acción aquí es inmediata y visible para el lector dueño
        del libro.
      </p>
      <div className="h-[5px] bg-[#201e1d] mt-[20px] mb-[2px]" />
      <div className="h-px bg-[#201e1d] mb-[24px]" />

      <div className="flex items-end gap-[16px] flex-wrap mb-[30px]">
        <label className="grid gap-[6px] flex-1 min-w-[260px]">
          <span className={sectionLabel}>Buscar</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Título, autor, descripción, categoría o lector"
            className={input}
          />
        </label>
        <div className="text-[15px] text-[#605d5d] pb-[14px]">
          {count === 1 ? "1 publicación" : `${count} publicaciones`}
        </div>
      </div>

      {count === 0 && <p className="text-[19px] text-[#444141]">No hay publicaciones que coincidan con la búsqueda.</p>}

      <div className="grid gap-[26px]">
        {items.map((b) => (
          <div key={b.id} className={`border-t ${divider} pt-[18px] grid [grid-template-columns:110px_1fr] gap-[20px]`}>
            <BookCover
              cover={b.cover}
              plate={b.plate}
              title={b.t}
              className="h-[150px] w-full rounded-[1px]"
              textClassName="p-[10px] text-[13px] leading-[1.2]"
            />

            <div className="grid gap-[8px]">
              <div className="text-[13px] tracking-[.14em] uppercase text-[#605d5d]">
                {b.ownerName}
                {b.isMine && " · tu cuenta"}
                {b.reserved && ` · reservado con ${b.reservedWith}`}
              </div>

              {b.editing ? (
                <div className="grid gap-[14px] max-w-[640px]">
                  <label className="grid gap-[6px]">
                    <span className={sectionLabel}>Título</span>
                    <input value={form.t} onChange={(e) => setTitle(e.target.value)} className={input} />
                  </label>
                  <label className="grid gap-[6px]">
                    <span className={sectionLabel}>Autor</span>
                    <input value={form.a} onChange={(e) => setAuthor(e.target.value)} className={input} />
                  </label>
                  <label className="grid gap-[6px]">
                    <span className={sectionLabel}>Descripción</span>
                    <textarea
                      value={form.desc}
                      onChange={(e) => setDesc(e.target.value)}
                      rows={3}
                      className={`${input} resize-y`}
                    />
                  </label>
                  <div className="grid gap-[6px]">
                    <span className={sectionLabel}>Categoría</span>
                    <div className="flex flex-wrap gap-[8px]">
                      {catChips.map((c) => (
                        <button key={c.label} onClick={c.pick} className={chip(c.active)}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-[6px]">
                    <span className={sectionLabel}>Estado</span>
                    <div className="flex flex-wrap gap-[8px]">
                      {condChips.map((c) => (
                        <button key={c.label} onClick={c.pick} className={chip(c.active)}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-[6px]">
                    <span className={sectionLabel}>Portada</span>
                    {cover ? (
                      <div className="flex items-center gap-[14px]">
                        <BookCover
                          cover={cover}
                          plate={b.plate}
                          title={b.t}
                          className="h-[70px] w-[52px] rounded-[1px]"
                          textClassName="p-[6px] text-[10px] leading-[1.15]"
                        />
                        <button
                          onClick={removeCover}
                          className="bg-transparent border-none p-0 text-[15px] text-[#aa0b56] hover:text-[#d6006c] transition-colors"
                        >
                          Quitar la foto
                        </button>
                      </div>
                    ) : (
                      <span className="text-[16px] text-[#605d5d]">Sin foto · portada tipográfica.</span>
                    )}
                  </div>
                  <label className="grid gap-[6px]">
                    <span className={sectionLabel}>Motivo de la edición</span>
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Queda registrado en la bitácora, junto a tu nombre"
                      className={input}
                    />
                  </label>
                  <div className="flex gap-[14px] items-center flex-wrap">
                    <button onClick={save} className={primaryBtn}>
                      Guardar cambios
                    </button>
                    <button onClick={cancelEdit} className={linkBtn}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-[24px] leading-[1.15]">{b.t}</div>
                  <div className="text-[15px] text-[#605d5d]">{b.a}</div>
                  <div className="flex gap-[8px] flex-wrap">
                    <span className={tagPill}>{b.cat}</span>
                    <span className={condPill}>{b.cond}</span>
                  </div>
                  {b.desc && <p className="text-[16px] leading-[1.5] text-[#444141] max-w-[46em]">{b.desc}</p>}
                  <div className="flex gap-[16px] items-center mt-[4px]">
                    <button onClick={b.edit} className={linkBtn}>
                      Editar publicación
                    </button>
                    <button
                      onClick={b.remove}
                      className="bg-transparent border-none p-0 text-[15px] text-[#aa0b56] hover:text-[#d6006c] transition-colors"
                    >
                      Eliminar por incumplir políticas
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-[54px]">
        <div className={sectionLabel}>Bitácora de moderación</div>
        <h2 className="text-[28px] leading-[1.15] mt-[6px] mb-[10px]">Últimas 50 acciones</h2>
        <p className="text-[16px] leading-[1.5] text-[#444141] max-w-[46em] mb-[20px]">
          Cada edición y cada eliminación queda registrada con su motivo. Los registros no se pueden modificar ni
          borrar, ni siquiera por quien los creó.
        </p>

        {logEmpty ? (
          <p className={`border-t ${divider} pt-[14px] text-[17px] text-[#605d5d]`}>
            Todavía no hay acciones de moderación registradas.
          </p>
        ) : (
          <div className="grid gap-[16px]">
            {log.map((e) => (
              <div key={e.id} className={`border-t ${divider} pt-[14px] grid gap-[6px]`}>
                <div className="text-[13px] tracking-[.14em] uppercase text-[#605d5d]">{e.when}</div>
                <div className="text-[18px] leading-[1.4]">
                  <span style={{ color: e.isDelete ? "#aa0b56" : "#006786" }}>{e.action}</span> «{e.bookTitle}» de{" "}
                  {e.ownerName} · {e.moderatorName}
                </div>
                <div className="text-[16px] leading-[1.5] text-[#444141]">Motivo: {e.reason}</div>
                {e.changes.length > 0 && (
                  <ul className="grid gap-[2px] text-[15px] leading-[1.45] text-[#605d5d]">
                    {e.changes.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
