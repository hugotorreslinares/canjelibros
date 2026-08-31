import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        <div className="font-sans text-label uppercase text-muted-foreground">Moderación</div>
        <h1 className="text-[40px] sm:text-[52px] leading-none mt-[8px] mb-[18px]">Panel restringido</h1>
        <p className="text-[17px] leading-[1.5] text-[#444141]">
          {signedIn
            ? "Tu cuenta no tiene permisos de moderación. Si crees que debería tenerlos, escríbenos a moderacion@librocambio.com."
            : "Inicia sesión con una cuenta de moderación para revisar publicaciones reportadas."}
        </p>
        <Button variant="outline" onClick={goPolicies} className="mt-6">
          Ver políticas del sitio
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-[1180px] px-[24px] sm:px-[40px] pt-[34px] pb-[60px]">
      <div className="font-sans text-label uppercase text-muted-foreground">Moderación</div>
      <h1 className="text-[40px] sm:text-[52px] leading-none mt-[8px] mb-0">Publicaciones de la comunidad</h1>
      <p className="text-[17px] leading-[1.5] text-[#444141] mt-[10px] max-w-[46em]">
        Edita una publicación para corregir o retirar datos que incumplan las{" "}
        <Button variant="link" onClick={goPolicies} className="px-0 h-auto">
          políticas del sitio
        </Button>
        , o elimínala si el contenido no puede corregirse. Toda acción aquí es inmediata y visible para el lector dueño
        del libro.
      </p>
      <div className="h-[5px] bg-[#201e1d] mt-[20px] mb-[2px]" />
      <div className="h-px bg-[#201e1d] mb-[24px]" />

      <div className="flex items-end gap-[16px] flex-wrap mb-[30px]">
        <label className="grid gap-[6px] flex-1 min-w-[260px]">
          <span className="font-sans text-label uppercase text-muted-foreground">Buscar</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Título, autor, descripción, categoría o lector"
            className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder"
          />
        </label>
        <div className="text-[15px] text-[#605d5d] pb-[14px]">
          {count === 1 ? "1 publicación" : `${count} publicaciones`}
        </div>
      </div>

      {count === 0 && <p className="text-[19px] text-[#444141]">No hay publicaciones que coincidan con la búsqueda.</p>}

      <div className="grid gap-[26px]">
        {items.map((b) => (
          <div key={b.id} className="border-t border-border pt-5 grid [grid-template-columns:110px_1fr] gap-5">
            <BookCover
              cover={b.cover}
              plate={b.plate}
              title={b.t}
              author={b.a}
              size="md"
              className="h-[165px] w-[110px] rounded-sm"
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
                    <span className="font-sans text-label uppercase text-muted-foreground">Título</span>
                    <input value={form.t} onChange={(e) => setTitle(e.target.value)} className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder" />
                  </label>
                  <label className="grid gap-[6px]">
                    <span className="font-sans text-label uppercase text-muted-foreground">Autor</span>
                    <input value={form.a} onChange={(e) => setAuthor(e.target.value)} className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder" />
                  </label>
                  <label className="grid gap-[6px]">
                    <span className="font-sans text-label uppercase text-muted-foreground">Descripción</span>
                    <textarea
                      value={form.desc}
                      onChange={(e) => setDesc(e.target.value)}
                      rows={3}
                      className={`border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder resize-y`}
                    />
                  </label>
                  <div className="grid gap-[6px]">
                    <span className="font-sans text-label uppercase text-muted-foreground">Categoría</span>
                    <div className="flex flex-wrap gap-[8px]">
                      {catChips.map((c) => (
                        <button key={c.label} onClick={c.pick} aria-pressed={c.active}
                          className={`h-11 min-h-[44px] px-4 rounded-sm border font-sans text-small transition-colors ${
                          c.active
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border-strong bg-transparent text-foreground/85 hover:bg-muted"
                        }`}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-[6px]">
                    <span className="font-sans text-label uppercase text-muted-foreground">Estado</span>
                    <div className="flex flex-wrap gap-[8px]">
                      {condChips.map((c) => (
                        <button key={c.label} onClick={c.pick} aria-pressed={c.active}
                          className={`h-11 min-h-[44px] px-4 rounded-sm border font-sans text-small transition-colors ${
                          c.active
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border-strong bg-transparent text-foreground/85 hover:bg-muted"
                        }`}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-[6px]">
                    <span className="font-sans text-label uppercase text-muted-foreground">Portada</span>
                    {cover ? (
                      <div className="flex items-center gap-[14px]">
                        <BookCover
                          cover={cover}
                          plate={b.plate}
                          title={b.t}
                          size="sm"
                          className="h-[78px] w-[52px] rounded-sm"
                        />
                        <Button variant="ghost" onClick={removeCover} className="text-destructive hover:text-destructive">
                          Quitar la foto
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[16px] text-[#605d5d]">Sin foto · portada tipográfica.</span>
                    )}
                  </div>
                  <label className="grid gap-[6px]">
                    <span className="font-sans text-label uppercase text-muted-foreground">Motivo de la edición</span>
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Queda registrado en la bitácora, junto a tu nombre"
                      className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder"
                    />
                  </label>
                  <div className="flex gap-[14px] items-center flex-wrap">
                    <Button onClick={save}>Guardar cambios</Button>
                    <Button variant="link" onClick={cancelEdit}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-[24px] leading-[1.15]">{b.t}</div>
                  <div className="text-[15px] text-[#605d5d]">{b.a}</div>
                  <div className="flex gap-[8px] flex-wrap">
                    <Badge variant="secondary">{b.cat}</Badge>
                    <Badge variant="outline">{b.cond}</Badge>
                  </div>
                  {b.desc && <p className="text-[16px] leading-[1.5] text-[#444141] max-w-[46em]">{b.desc}</p>}
                  <div className="flex gap-[16px] items-center mt-[4px]">
                    <Button variant="link" onClick={b.edit} className="px-0">
                      Editar publicación
                    </Button>
                    <Button variant="ghost" onClick={b.remove} className="text-destructive hover:text-destructive">
                      Eliminar por incumplir políticas
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-[54px]">
        <div className="font-sans text-label uppercase text-muted-foreground">Bitácora de moderación</div>
        <h2 className="text-[28px] leading-[1.15] mt-[6px] mb-[10px]">Últimas 50 acciones</h2>
        <p className="text-[16px] leading-[1.5] text-[#444141] max-w-[46em] mb-[20px]">
          Cada edición y cada eliminación queda registrada con su motivo. Los registros no se pueden modificar ni
          borrar, ni siquiera por quien los creó.
        </p>

        {logEmpty ? (
          <p className="border-t border-border pt-3.5 font-serif text-body text-muted-foreground">
            Todavía no hay acciones de moderación registradas.
          </p>
        ) : (
          <div className="grid gap-[16px]">
            {log.map((e) => (
              <div key={e.id} className="border-t border-border pt-3.5 grid gap-1.5">
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
