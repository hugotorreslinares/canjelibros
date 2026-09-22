import { useState } from "react";
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
  ownerSuspended: boolean;
  ownerSlots: number;
  ownerSlotOverride: number | null;
  isMine: boolean;
  reserved: boolean;
  reservedWith: string;
  plate: string;
  editing: boolean;
  edit: () => void;
  remove: () => void;
  toggleSuspend: () => void;
  setSlots: (value: number | null) => void;
}

interface ReportItem {
  id: string;
  kind: "book" | "message";
  title: string;
  messageText: string;
  targetOwnerName: string;
  reason: string;
  status: "open" | "resolved";
  when: string;
  resolved: boolean;
  jumpToBook?: () => void;
  removeMessage?: () => void;
  resolve: () => void;
  suspendOwner: () => void;
}

interface LogEntry {
  id: string;
  when: string;
  line: string;
  isDelete: boolean;
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
  tab: "books" | "reports";
  setTab: (t: "books" | "reports") => void;
  openReportCount: number;
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
  reportItems: ReportItem[];
  logQuery: string;
  setLogQuery: (v: string) => void;
  log: LogEntry[];
  logEmpty: boolean;
  save: () => void;
  cancelEdit: () => void;
  goPolicies: () => void;
}

// Un lector con varios libros repite este control una vez por fila —igual que
// «Suspender cuenta»—, así que el campo empieza sin editar y solo el que se
// toca manda un valor nuevo, para no pelear con lo que otra fila del mismo
// dueño acaba de guardar.
function SlotsControl({
  ownerName,
  slots,
  override,
  setSlots,
}: {
  ownerName: string;
  slots: number;
  override: number | null;
  setSlots: (value: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(slots));

  if (!editing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-sans text-small text-muted-foreground">
          Cupos de {ownerName}: {slots}
          {override !== null && " (ajustado a mano)"}
        </span>
        <Button
          variant="link"
          onClick={() => {
            setValue(String(slots));
            setEditing(true);
          }}
          className="px-0 h-auto"
        >
          Ajustar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label className="flex items-center gap-2">
        <span className="font-sans text-small text-muted-foreground">Cupos de {ownerName}</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 border border-input rounded-sm bg-card px-2 py-1.5 font-serif text-body text-foreground outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        />
      </label>
      <Button
        variant="link"
        className="px-0 h-auto"
        onClick={() => {
          const n = Number(value);
          if (Number.isInteger(n) && n >= 0) setSlots(n);
          setEditing(false);
        }}
      >
        Guardar
      </Button>
      {override !== null && (
        <Button
          variant="link"
          className="px-0 h-auto text-muted-foreground"
          onClick={() => {
            setSlots(null);
            setEditing(false);
          }}
        >
          Quitar ajuste
        </Button>
      )}
      <Button variant="link" className="px-0 h-auto text-muted-foreground" onClick={() => setEditing(false)}>
        Cancelar
      </Button>
    </div>
  );
}

export function ModerationView({
  allowed,
  signedIn,
  tab,
  setTab,
  openReportCount,
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
  reportItems,
  logQuery,
  setLogQuery,
  log,
  logEmpty,
  save,
  cancelEdit,
  goPolicies,
}: ModerationViewProps) {
  if (!allowed) {
    return (
      <div className="px-6 sm:px-10 pt-8 pb-16 max-w-[720px]">
        <div className="font-sans text-label uppercase text-muted-foreground">Moderación</div>
        <h1 className="font-serif text-display mt-2 mb-5">Panel restringido</h1>
        <p className="font-serif text-body text-foreground/85">
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
    <div className="w-full mx-auto max-w-[1180px] px-6 sm:px-10 pt-8 pb-16">
      <div className="font-sans text-label uppercase text-muted-foreground">Moderación</div>
      <h1 className="font-serif text-display mt-2 mb-0">Publicaciones de la comunidad</h1>
      <p className="font-serif text-body text-foreground/85 mt-3 max-w-[46em]">
        Edita una publicación para corregir o retirar datos que incumplan las{" "}
        <Button variant="link" onClick={goPolicies} className="px-0 h-auto">
          políticas del sitio
        </Button>
        , o elimínala si el contenido no puede corregirse. Toda acción aquí es inmediata y visible para el lector dueño
        del libro.
      </p>
      <div className="h-[5px] bg-foreground mt-5 mb-0.5" />
      <div className="h-px bg-foreground mb-6" />

      <div className="flex gap-2 mb-8 border-b border-border">
        <button
          onClick={() => setTab("books")}
          aria-current={tab === "books" ? "page" : undefined}
          className={`h-11 min-h-[44px] px-1 -mb-px border-b-2 font-sans text-small ${
            tab === "books" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          }`}
        >
          Publicaciones
        </button>
        <button
          onClick={() => setTab("reports")}
          aria-current={tab === "reports" ? "page" : undefined}
          className={`h-11 min-h-[44px] px-4 -mb-px border-b-2 font-sans text-small ${
            tab === "reports" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          }`}
        >
          Reportes{openReportCount > 0 && <span className="ml-1.5 text-destructive">· {openReportCount}</span>}
        </button>
      </div>

      {tab === "reports" && (
        <section className="mb-14">
          {reportItems.length === 0 ? (
            <p className="font-serif text-body text-foreground/85">Todavía no hay reportes.</p>
          ) : (
            <div className="grid gap-5">
              {reportItems.map((r) => (
                <div key={r.id} className="border-t border-border pt-4 grid gap-1.5">
                  <div className="flex justify-between gap-3 flex-wrap">
                    <div className="font-sans text-label uppercase text-muted-foreground">
                      {r.kind === "book" ? "Publicación" : "Mensaje"} de {r.targetOwnerName} · {r.when}
                    </div>
                    <Badge variant={r.resolved ? "outline" : "secondary"}>
                      {r.resolved ? "Resuelto" : "Abierto"}
                    </Badge>
                  </div>
                  <div className="font-serif text-subtitle">{r.title}</div>
                  {r.kind === "message" && (
                    <p className="font-serif text-body text-foreground/85 italic border-l-2 border-border pl-3">
                      «{r.messageText}»
                    </p>
                  )}
                  <div className="font-serif text-body text-foreground/85">Motivo del reporte: {r.reason}</div>
                  {!r.resolved && (
                    <div className="flex gap-4 items-center flex-wrap mt-1">
                      {r.jumpToBook && (
                        <Button variant="link" onClick={r.jumpToBook} className="px-0">
                          Buscar esta publicación
                        </Button>
                      )}
                      {r.removeMessage && (
                        <Button variant="ghost" onClick={r.removeMessage} className="text-destructive hover:text-destructive">
                          Eliminar mensaje
                        </Button>
                      )}
                      <Button variant="ghost" onClick={r.suspendOwner} className="text-destructive hover:text-destructive">
                        Suspender cuenta
                      </Button>
                      <Button variant="link" onClick={r.resolve} className="px-0">
                        Marcar como resuelto
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "books" && (
      <>
      <div className="flex items-end gap-4 flex-wrap mb-8">
        <label className="grid gap-1.5 flex-1 min-w-[260px]">
          <span className="font-sans text-label uppercase text-muted-foreground">Buscar</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Título, autor, descripción, categoría o lector"
            className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder"
          />
        </label>
        <div className="font-sans text-small text-muted-foreground pb-3.5">
          {count === 1 ? "1 publicación" : `${count} publicaciones`}
        </div>
      </div>

      {count === 0 && <p className="font-serif text-body text-foreground/85">No hay publicaciones que coincidan con la búsqueda.</p>}

      <div className="grid gap-6">
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

            <div className="grid gap-2">
              <div className="font-sans text-label uppercase text-muted-foreground">
                {b.ownerName}
                {b.isMine && " · tu cuenta"}
                {b.reserved && ` · reservado con ${b.reservedWith}`}
                {b.ownerSuspended && <span className="text-destructive"> · cuenta suspendida</span>}
              </div>

              {b.editing ? (
                <div className="grid gap-3.5 max-w-[640px]">
                  <label className="grid gap-1.5">
                    <span className="font-sans text-label uppercase text-muted-foreground">Título</span>
                    <input value={form.t} onChange={(e) => setTitle(e.target.value)} className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="font-sans text-label uppercase text-muted-foreground">Autor</span>
                    <input value={form.a} onChange={(e) => setAuthor(e.target.value)} className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="font-sans text-label uppercase text-muted-foreground">Descripción</span>
                    <textarea
                      value={form.desc}
                      onChange={(e) => setDesc(e.target.value)}
                      rows={3}
                      className={`border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder resize-y`}
                    />
                  </label>
                  <div className="grid gap-1.5">
                    <span className="font-sans text-label uppercase text-muted-foreground">Categoría</span>
                    <div className="flex flex-wrap gap-2">
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
                  <div className="grid gap-1.5">
                    <span className="font-sans text-label uppercase text-muted-foreground">Estado</span>
                    <div className="flex flex-wrap gap-2">
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
                  <div className="grid gap-1.5">
                    <span className="font-sans text-label uppercase text-muted-foreground">Portada</span>
                    {cover ? (
                      <div className="flex items-center gap-3.5">
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
                      <span className="font-sans text-small text-muted-foreground">Sin foto · portada tipográfica.</span>
                    )}
                  </div>
                  <label className="grid gap-1.5">
                    <span className="font-sans text-label uppercase text-muted-foreground">Motivo de la edición</span>
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Queda registrado en la bitácora, junto a tu nombre"
                      className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder"
                    />
                  </label>
                  <div className="flex gap-3.5 items-center flex-wrap">
                    <Button onClick={save}>Guardar cambios</Button>
                    <Button variant="link" onClick={cancelEdit}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-serif text-subtitle">{b.t}</div>
                  <div className="font-sans text-small text-muted-foreground">{b.a}</div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{b.cat}</Badge>
                    <Badge variant="outline">{b.cond}</Badge>
                  </div>
                  {b.desc && <p className="font-serif text-body text-foreground/85 max-w-[46em]">{b.desc}</p>}
                  <div className="flex gap-4 items-center mt-1 flex-wrap">
                    <Button variant="link" onClick={b.edit} className="px-0">
                      Editar publicación
                    </Button>
                    <Button variant="ghost" onClick={b.remove} className="text-destructive hover:text-destructive">
                      Eliminar por incumplir políticas
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={b.toggleSuspend}
                      className={b.ownerSuspended ? undefined : "text-destructive hover:text-destructive"}
                    >
                      {b.ownerSuspended ? `Reactivar cuenta de ${b.ownerName}` : `Suspender cuenta de ${b.ownerName}`}
                    </Button>
                  </div>
                  <SlotsControl
                    ownerName={b.ownerName}
                    slots={b.ownerSlots}
                    override={b.ownerSlotOverride}
                    setSlots={b.setSlots}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      </>
      )}

      <section className="mt-14">
        <div className="font-sans text-label uppercase text-muted-foreground">Bitácora de moderación</div>
        <h2 className="font-serif text-title mt-1.5 mb-3">Últimas 50 acciones</h2>
        <p className="font-serif text-body text-foreground/85 max-w-[46em] mb-5">
          Cada edición y cada eliminación queda registrada con su motivo. Los registros no se pueden modificar ni
          borrar, ni siquiera por quien los creó.
        </p>

        {!logEmpty && (
          <input
            value={logQuery}
            onChange={(e) => setLogQuery(e.target.value)}
            placeholder="Buscar en la bitácora"
            className="border border-input rounded-sm bg-card px-3.5 py-3 mb-5 font-serif text-body text-foreground w-full max-w-[420px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder"
          />
        )}

        {logEmpty ? (
          <p className="border-t border-border pt-3.5 font-serif text-body text-muted-foreground">
            Todavía no hay acciones de moderación registradas.
          </p>
        ) : log.length === 0 ? (
          <p className="border-t border-border pt-3.5 font-serif text-body text-muted-foreground">
            Ninguna entrada coincide con la búsqueda.
          </p>
        ) : (
          <div className="grid gap-4">
            {log.map((e) => (
              <div key={e.id} className="border-t border-border pt-3.5 grid gap-1.5">
                <div className="font-sans text-label uppercase text-muted-foreground">{e.when}</div>
                <div className="font-serif text-body">
                  <span className={e.isDelete ? "text-destructive" : "text-primary-text"}>{e.line}</span> ·{" "}
                  {e.moderatorName}
                </div>
                <div className="font-serif text-body text-foreground/85">Motivo: {e.reason}</div>
                {e.changes.length > 0 && (
                  <ul className="grid gap-0.5 font-sans text-small text-muted-foreground">
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
