import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";
import { AppSidebar } from "@/components/app-sidebar";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { FloatingDock } from "@/components/FloatingDock";
import SidebarToggle from "@/components/SideBarToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { ChatSheet } from "@/components/app/ChatSheet";
import { FloatingChatTrigger } from "@/components/app/FloatingChatTrigger";
import { MainContentWrapper } from "@/components/app/MainContentWrapper";
import { PageTracker } from "@/components/app/PageTracker";

export const metadata: Metadata = {
  title: "Portfolio | Pius Khainja",
  description: "Personal portfolio website for Pius Khainja.",
};

export default async function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ChatStoreProvider>
        <SidebarProvider defaultOpen={false}>
          <SidebarInset className="">
            <MainContentWrapper>{children}</MainContentWrapper>
          </SidebarInset>

          <AppSidebar side="right" />

          <FloatingDock />
          <SidebarToggle />
        </SidebarProvider>

        <ChatSheet />
        <FloatingChatTrigger />
        <PageTracker />

        <SanityLive />

        {(await draftMode()).isEnabled && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </ChatStoreProvider>
    </ThemeProvider>
  );
}
