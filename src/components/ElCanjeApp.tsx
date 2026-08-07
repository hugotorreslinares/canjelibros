"use client";

import { useAppState } from "@/hooks/use-app-state";
import { AuthModal } from "./AuthModal";
import { CatalogView } from "./CatalogView";
import { ChatView } from "./ChatView";
import { Header } from "./Header";
import { MapView } from "./MapView";
import { OfferModal } from "./OfferModal";
import { Onboarding } from "./Onboarding";
import { PublishView } from "./PublishView";
import { RatingModal } from "./RatingModal";
import { ShelfView } from "./ShelfView";
import { Toast } from "./Toast";

export function ElCanjeApp() {
  const state = useAppState();

  return (
    <div className="flex-1 flex flex-col">
      {state.isOnboarding && <Onboarding {...state.onboarding} />}

      {state.isApp && (
        <div className="flex-1 flex flex-col">
          <Header {...state.header} />
          {state.mapView.isMap && <MapView {...state.mapView} />}
          {state.catalogView.isCatalog && <CatalogView {...state.catalogView} />}
          {state.shelfView.isShelf && <ShelfView {...state.shelfView} />}
          {state.publishView.isPublish && <PublishView {...state.publishView} />}
          {state.chatView.isChat && <ChatView {...state.chatView} />}
        </div>
      )}

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
