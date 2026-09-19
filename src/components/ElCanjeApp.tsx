"use client";

import { useAppState } from "@/hooks/use-app-state";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { AuthModal } from "./AuthModal";
import { CatalogView } from "./CatalogView";
import { HomeHero } from "./HomeHero";
import { NearbyBooks, type NearbyItem } from "./NearbyBooks";
import { MapDiscovery } from "./MapDiscovery";
import { DeleteDialog } from "./DeleteDialog";
import { ChatView } from "./ChatView";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MapView } from "./MapView";
import { ModerationView } from "./ModerationView";
import { OfferModal } from "./OfferModal";
import { PoliciesView } from "./PoliciesView";
import { PublishView } from "./PublishView";
import { RatingModal } from "./RatingModal";
import { ReportDialog } from "./ReportDialog";
import { ShelfView } from "./ShelfView";
import { Toaster } from "@/components/ui/sonner";

export function ElCanjeApp({ initialNearby }: { initialNearby: NearbyItem[] }) {
  const state = useAppState(initialNearby);
  useScrollReveal();

  return (
    <div className="flex-1 flex flex-col">
      <Header {...state.header} />
      <main id="contenido" className="flex-1 flex flex-col scroll-mt-16">
        {state.mapView.isMap && <MapView {...state.mapView} />}
        {state.homeHero.show && <HomeHero {...state.homeHero} />}
        {state.nearbyBooks.show && <NearbyBooks {...state.nearbyBooks} />}
        {state.catalogView.isCatalog && <CatalogView {...state.catalogView} />}
        {state.mapDiscovery.show && <MapDiscovery {...state.mapDiscovery} />}
        {state.shelfView.isShelf && <ShelfView {...state.shelfView} />}
        {state.publishView.isPublish && <PublishView {...state.publishView} />}
        {state.chatView.isChat && <ChatView key={state.chatView.thread.id} {...state.chatView} />}
        {state.moderationView.isModeration && <ModerationView {...state.moderationView} />}
        {state.policiesView.isPolicies && <PoliciesView {...state.policiesView} />}
      </main>

      <Footer />

      <Toaster position="bottom-center" />
      <OfferModal {...state.offerModal} />
      <DeleteDialog {...state.deleteDialog} />
      <RatingModal {...state.ratingModal} />
      <ReportDialog {...state.reportDialog} />
      <AuthModal
        open={state.authModal.open}
        reason={state.authModal.reason}
        onClose={state.authModal.close}
        onSuccess={state.authModal.onSuccess}
      />
    </div>
  );
}
