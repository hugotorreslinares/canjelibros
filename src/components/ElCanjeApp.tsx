"use client";

import { useAppState } from "@/hooks/use-app-state";
import { linkBtn } from "@/lib/ui";
import { AuthModal } from "./AuthModal";
import { CatalogView } from "./CatalogView";
import { ChatView } from "./ChatView";
import { Header } from "./Header";
import { MapView } from "./MapView";
import { ModerationView } from "./ModerationView";
import { OfferModal } from "./OfferModal";
import { PoliciesView } from "./PoliciesView";
import { PublishView } from "./PublishView";
import { RatingModal } from "./RatingModal";
import { ShelfView } from "./ShelfView";
import { Toast } from "./Toast";

export function ElCanjeApp() {
  const state = useAppState();

  return (
    <div className="flex-1 flex flex-col">
      <Header {...state.header} />
      {state.mapView.isMap && <MapView {...state.mapView} />}
      {state.catalogView.isCatalog && <CatalogView {...state.catalogView} />}
      {state.shelfView.isShelf && <ShelfView {...state.shelfView} />}
      {state.publishView.isPublish && <PublishView {...state.publishView} />}
      {state.chatView.isChat && <ChatView key={state.chatView.thread.id} {...state.chatView} />}
      {state.moderationView.isModeration && <ModerationView {...state.moderationView} />}
      {state.policiesView.isPolicies && <PoliciesView {...state.policiesView} />}

      <footer className="mt-auto px-[24px] sm:px-[40px] py-[18px] border-t border-[#201e1d]/16 flex items-center gap-[16px] flex-wrap text-[15px] text-[#605d5d]">
        <span>El Canje · Bogotá</span>
        <button onClick={state.goPolicies} className={linkBtn}>
          Políticas del sitio
        </button>
      </footer>

      <Toast {...state.toast} />
      <OfferModal {...state.offerModal} />
      <RatingModal {...state.ratingModal} />
      <AuthModal
        open={state.authModal.open}
        reason={state.authModal.reason}
        onClose={state.authModal.close}
        onSuccess={state.authModal.onSuccess}
      />
    </div>
  );
}
