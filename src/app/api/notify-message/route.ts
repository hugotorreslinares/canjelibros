import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { SITE_URL } from "@/lib/seo";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM ?? "Librocambio <notificaciones@librocambio.com>";

interface Body {
  threadId?: string;
  messageId?: string;
}

function escapeHtml(text: string): string {
  const table: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return text.replace(/[&<>"']/g, (c) => table[c]);
}

/**
 * Aviso por correo al otro participante de un hilo cuando llega un mensaje
 * nuevo — una respuesta, o el primer mensaje de una propuesta de canje.
 * `sendThreadMessage` en `firestore-data.ts` lo llama después de escribir el
 * mensaje, sin esperar la respuesta: si esto falla o no está configurado
 * (Firebase admin, Resend), el mensaje ya quedó escrito igual.
 *
 * ponytail: manda un correo por mensaje, sin enfriamiento por hilo — si una
 * conversación rápida resulta ruidosa, añadir un mínimo entre avisos por hilo.
 */
export async function POST(req: Request) {
  if (!isFirebaseAdminConfigured || !RESEND_API_KEY || !adminDb) {
    return NextResponse.json({ skipped: true });
  }

  const { threadId, messageId } = (await req.json()) as Body;
  if (!threadId || !messageId) {
    return NextResponse.json({ error: "faltan threadId o messageId" }, { status: 400 });
  }

  try {
    const [threadSnap, messageSnap] = await Promise.all([
      adminDb.doc(`threads/${threadId}`).get(),
      adminDb.doc(`threads/${threadId}/messages/${messageId}`).get(),
    ]);
    const thread = threadSnap.data();
    const message = messageSnap.data();
    if (!thread || !message) return NextResponse.json({ skipped: true });

    const participants = (thread.participants ?? []) as string[];
    const recipientUid = participants.find((uid) => uid !== message.senderId);
    if (!recipientUid) return NextResponse.json({ skipped: true });

    const [recipientEmailSnap, senderReader] = await Promise.all([
      adminDb.doc(`readerEmails/${recipientUid}`).get(),
      adminDb.doc(`readers/${message.senderId}`).get(),
    ]);
    const recipientEmail = recipientEmailSnap.data()?.email as string | undefined;
    if (!recipientEmail) return NextResponse.json({ skipped: true });

    const senderName = (senderReader.data()?.name as string | undefined) || "Un lector";
    const preview = String(message.text ?? "").slice(0, 240);
    const url = `${SITE_URL}/mensajes`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [recipientEmail],
        subject: `${senderName} te escribió en Librocambio`,
        text: `${senderName}: ${preview}\n\nResponde en ${url}`,
        html: `<p><strong>${escapeHtml(senderName)}</strong> te escribió en Librocambio:</p><p>${escapeHtml(preview)}</p><p><a href="${url}">Responder</a></p>`,
      }),
    });
    if (!res.ok) console.error("Resend respondió", res.status, await res.text());

    return NextResponse.json({ ok: res.ok });
  } catch (err) {
    console.error("no se pudo enviar el aviso por correo", err);
    return NextResponse.json({ ok: false });
  }
}
