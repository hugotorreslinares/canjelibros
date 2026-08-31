"use client";

import { useAppState } from "@/hooks/use-app-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";
import { CatalogView } from "./CatalogView";
import { HomeHero } from "./HomeHero";
import { DeleteDialog } from "./DeleteDialog";
import { ChatView } from "./ChatView";
import { Header } from "./Header";
import { MapView } from "./MapView";
import { ModerationView } from "./ModerationView";
import { OfferModal } from "./OfferModal";
import { PoliciesView } from "./PoliciesView";
import { PublishView } from "./PublishView";
import { RatingModal } from "./RatingModal";
import { ShelfView } from "./ShelfView";
import { Toaster } from "@/components/ui/sonner";

export function ElCanjeApp() {
  const state = useAppState();

  return (
    <div className="flex-1 flex flex-col">
      <Header {...state.header} />
      <main className="flex-1 flex flex-col">
        {state.mapView.isMap && <MapView {...state.mapView} />}
        {state.homeHero.show && <HomeHero {...state.homeHero} />}
        {state.catalogView.isCatalog && <CatalogView {...state.catalogView} />}
        {state.shelfView.isShelf && <ShelfView {...state.shelfView} />}
        {state.publishView.isPublish && <PublishView {...state.publishView} />}
        {state.chatView.isChat && <ChatView key={state.chatView.thread.id} {...state.chatView} />}
        {state.moderationView.isModeration && <ModerationView {...state.moderationView} />}
        {state.policiesView.isPolicies && <PoliciesView {...state.policiesView} />}
      </main>

      <footer className="mt-auto px-4 sm:px-10 py-3 border-t border-border flex items-center gap-4 flex-wrap font-sans text-small text-muted-foreground">
        <span>Librocambio · Bogotá</span>
        <Button variant="link" asChild className="px-0">
          <Link href="/politicas">Políticas del sitio</Link>
        </Button>
      </footer>

      <Toaster position="bottom-center" />
      <OfferModal {...state.offerModal} />
      <DeleteDialog {...state.deleteDialog} />
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
