import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent className="h-full w-full bg-white">
        {/* Sidebar content can be added here if needed.
            AI chat now lives in the floating button + sheet instead of this sidebar. */}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
