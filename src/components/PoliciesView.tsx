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
    <div className="px-[24px] sm:px-[40px] pt-[34px] pb-[60px] max-w-[820px]">
      <div className="font-sans text-label uppercase text-muted-foreground">Políticas del sitio</div>
      <h1 className="text-[40px] sm:text-[52px] leading-none mt-[8px] mb-0">Qué se puede publicar en Librocambio</h1>
      <p className="text-[17px] leading-[1.5] text-[#444141] mt-[12px]">
        Última actualización: 25 de agosto de 2026 · Aplica a todo el contenido publicado en el mapa, el catálogo y los
        mensajes.
      </p>
      <div className="h-[5px] bg-[#201e1d] mt-[20px] mb-[2px]" />
      <div className="h-px bg-[#201e1d] mb-[34px]" />

      <section className="mb-[38px]">
        <h2 className="text-[28px] leading-[1.15] mb-[10px]">1. Para qué sirve Librocambio</h2>
        <p className="text-[18px] leading-[1.55] text-[#201e1d]">
          Librocambio es una plataforma vecinal para intercambiar libros físicos usados entre lectores de Bogotá. No es una
          tienda, no intermediamos pagos y no alojamos archivos digitales. Cada lector es responsable de los ejemplares
          que publica y de lo que escribe en sus conversaciones.
        </p>
      </section>

      <section className="mb-[38px]">
        <h2 className="text-[28px] leading-[1.15] mb-[10px]">2. Contenido prohibido</h2>
        <p className="text-[18px] leading-[1.55] text-[#201e1d] mb-[16px]">
          Está prohibido publicar, ofrecer, solicitar o compartir por este medio libros, documentos o artículos cuya
          circulación esté prohibida por la ley colombiana. En particular:
        </p>
        <ul className="grid gap-[12px]">
          {PROHIBITED.map((item) => (
            <li key={item} className="border-t border-border pt-3 font-serif text-body text-foreground/85">
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[16px] leading-[1.5] text-[#605d5d] mt-[18px]">
          Estas conductas pueden constituir infracciones a la normativa colombiana sobre derecho de autor (Ley 23 de
          1982 y sus modificaciones), protección de datos personales (Ley 1581 de 2012) y al Código Penal, entre otras.
          Este texto es un reglamento de uso, no asesoría jurídica.
        </p>
      </section>

      <section className="mb-[38px]">
        <h2 className="text-[28px] leading-[1.15] mb-[10px]">3. Reglas de convivencia</h2>
        <ul className="grid gap-[12px]">
          {RULES.map((item) => (
            <li key={item} className="border-t border-border pt-3 font-serif text-body text-foreground/85">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-[38px]">
        <h2 className="text-[28px] leading-[1.15] mb-[10px]">4. Moderación</h2>
        <p className="text-[18px] leading-[1.55] text-[#201e1d]">
          Un equipo de moderación revisa las publicaciones reportadas. Puede editar una publicación para retirar datos
          que incumplan estas políticas —por ejemplo, datos personales de terceros— o eliminarla por completo cuando el
          contenido no pueda corregirse. Las publicaciones eliminadas no se restauran. Las cuentas que reincidan pueden
          perder el acceso a la plataforma, y los casos que impliquen posible comisión de un delito se ponen en
          conocimiento de las autoridades.
        </p>
      </section>

      <section className="mb-[38px]">
        <h2 className="text-[28px] leading-[1.15] mb-[10px]">5. Cómo reportar</h2>
        <p className="text-[18px] leading-[1.55] text-[#201e1d]">
          Escribe a <span className="text-[#006786]">moderacion@librocambio.com</span> con el título del libro, el nombre del
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
