import { Button } from "@/components/ui/button";

interface PoliciesViewProps {
  goHome: () => void;
}

const PROHIBITED = [
  "Copias piratas, fotocopias íntegras, escaneos o archivos digitales de obras protegidas por derecho de autor sin autorización del titular.",
  "Material con contenido de explotación sexual de menores de edad, en cualquier formato o soporte.",
  "Publicaciones que inciten a la violencia, al terrorismo, al genocidio o a la discriminación por raza, origen, religión, género, orientación sexual o discapacidad.",
  "Documentos públicos o privados robados, falsificados o alterados: cédulas, pasaportes, títulos, certificados, historias clínicas o expedientes judiciales.",
  "Documentos sometidos a reserva legal, información clasificada o secretos empresariales de terceros.",
  "Manuales o instructivos para fabricar armas, explosivos, drogas ilícitas o para cometer delitos informáticos.",
  "Bienes distintos a libros: no se permite usar el catálogo para ofrecer sustancias, armas, medicamentos, animales ni servicios.",
  "Libros que sean producto de hurto, incluidos ejemplares retirados de bibliotecas públicas o institucionales.",
  "Imágenes de las que no eres titular: portadas descargadas de internet, fotos tomadas de otro anuncio o ilustraciones de la editorial. La foto debe ser tuya, del ejemplar que ofreces.",
  "Datos personales de terceros —direcciones exactas, teléfonos, documentos de identidad— publicados sin su consentimiento.",
];

const RULES = [
  "Publica solo ejemplares físicos que tengas en tu poder y que puedas entregar en mano.",
  "Describe el estado real del libro. Exagerar la condición es motivo de reporte.",
  "Acuerda los encuentros en lugares públicos y concurridos.",
  "La foto de portada es opcional: si no subes ninguna, mostramos el título como portada tipográfica. No fotografíes personas ni documentos junto al libro.",
  "Trata a los demás lectores con respeto en los mensajes: no se toleran insultos, acoso ni spam.",
];

export function PoliciesView({ goHome }: PoliciesViewProps) {
  return (
    <div className="w-full mx-auto max-w-[820px] px-6 sm:px-10 pt-8 pb-16">
      <div className="font-sans text-label uppercase text-muted-foreground">Políticas del sitio</div>
      <h1 className="font-serif text-display mt-2 mb-0">Qué se puede publicar en Librocambio</h1>
      <p className="font-sans text-small text-muted-foreground mt-3">
        Última actualización: 25 de agosto de 2026 · Aplica a todo el contenido publicado en el mapa, el catálogo y los
        mensajes.
      </p>
      <div className="h-[5px] bg-foreground mt-5 mb-0.5" />
      <div className="h-px bg-foreground mb-8" />

      <section data-reveal className="mb-10">
        <h2 className="font-serif text-title mb-3">1. Para qué sirve Librocambio</h2>
        <p className="font-serif text-body text-foreground">
          Librocambio es una plataforma vecinal para intercambiar libros físicos usados entre lectores de Bogotá. No es una
          tienda, no intermediamos pagos y no alojamos archivos digitales. Cada lector es responsable de los ejemplares
          que publica y de lo que escribe en sus conversaciones.
        </p>
      </section>

      <section data-reveal className="mb-10">
        <h2 className="font-serif text-title mb-3">2. Contenido prohibido</h2>
        <p className="font-serif text-body text-foreground mb-4">
          Está prohibido publicar, ofrecer, solicitar o compartir por este medio libros, documentos o artículos cuya
          circulación esté prohibida por la ley colombiana. En particular:
        </p>
        <ul className="grid gap-3">
          {PROHIBITED.map((item) => (
            <li key={item} className="border-t border-border pt-3 font-serif text-body text-foreground/85">
              {item}
            </li>
          ))}
        </ul>
        <p className="font-sans text-small text-muted-foreground mt-5">
          Estas conductas pueden constituir infracciones a la normativa colombiana sobre derecho de autor (Ley 23 de
          1982 y sus modificaciones), protección de datos personales (Ley 1581 de 2012) y al Código Penal, entre otras.
          Este texto es un reglamento de uso, no asesoría jurídica.
        </p>
      </section>

      <section data-reveal className="mb-10">
        <h2 className="font-serif text-title mb-3">3. Reglas de convivencia</h2>
        <ul className="grid gap-3">
          {RULES.map((item) => (
            <li key={item} className="border-t border-border pt-3 font-serif text-body text-foreground/85">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section data-reveal className="mb-10">
        <h2 className="font-serif text-title mb-3">4. Moderación</h2>
        <p className="font-serif text-body text-foreground">
          Un equipo de moderación revisa las publicaciones reportadas. Puede editar una publicación para retirar datos
          que incumplan estas políticas —por ejemplo, datos personales de terceros— o eliminarla por completo cuando el
          contenido no pueda corregirse. Las publicaciones eliminadas no se restauran. Las cuentas que reincidan pueden
          perder el acceso a la plataforma, y los casos que impliquen posible comisión de un delito se ponen en
          conocimiento de las autoridades.
        </p>
      </section>

      <section data-reveal className="mb-10">
        <h2 className="font-serif text-title mb-3">5. Cómo reportar</h2>
        <p className="font-serif text-body text-foreground">
          Escribe a <span className="text-primary">moderacion@librocambio.com</span> con el título del libro, el nombre del
          lector que lo publicó y el motivo. Revisamos los reportes en orden de llegada y damos prioridad a los que
          involucran menores de edad o datos personales expuestos.
        </p>
      </section>

      <Button variant="outline" onClick={goHome}>
        Volver al catálogo
      </Button>
    </div>
  );
}
