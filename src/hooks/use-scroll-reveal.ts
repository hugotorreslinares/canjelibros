"use client";

import { useEffect } from "react";

// Distancia por debajo del borde inferior a la que un elemento ya cuenta como
// visible. Esperar a que asome del todo hace que la animación se vea empezar,
// que es justo lo que no debe notarse.
const MARGEN = "0px 0px -12% 0px";

/**
 * Muestra con una transición suave cada `[data-reveal]` al entrar en pantalla.
 *
 * No usa estado de React a propósito: el catálogo se redibuja con cada
 * instantánea de Firestore, y marcar la aparición en el DOM evita que un
 * elemento ya revelado vuelva a esconderse al re-renderizar. Un elemento solo
 * se anima una vez; después se deja de observar.
 */
export function useScrollReveal(): void {
  useEffect(() => {
    const raiz = document.documentElement;

    // Sin soporte de IntersectionObserver no se esconde nada: mejor sin
    // animación que con la página en blanco.
    if (typeof IntersectionObserver === "undefined") return;

    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (menosMovimiento.matches) return;

    raiz.classList.add("js-reveal");

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          (entrada.target as HTMLElement).dataset.revealed = "";
          observador.unobserve(entrada.target);
        }
      },
      { rootMargin: MARGEN, threshold: 0 }
    );

    const observarNuevos = () => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])")
        .forEach((el) => observador.observe(el));
    };

    observarNuevos();

    // El catálogo llega por suscripción, así que hay elementos que aparecen
    // después de este efecto. Sin esto se quedarían invisibles para siempre.
    // Una instantánea de Firestore dispara muchas mutaciones seguidas, así que
    // se agrupan en un solo repaso por fotograma en vez de recorrer el DOM
    // entero con cada una.
    let pendiente = 0;
    const vigilante = new MutationObserver(() => {
      if (pendiente) return;
      pendiente = requestAnimationFrame(() => {
        pendiente = 0;
        observarNuevos();
      });
    });
    vigilante.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (pendiente) cancelAnimationFrame(pendiente);
      vigilante.disconnect();
      observador.disconnect();
      raiz.classList.remove("js-reveal");
    };
  }, []);
}
