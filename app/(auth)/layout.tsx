import { AssistantLogo } from "@/components/chat/icons";
import { Preview } from "@/components/chat/preview";
import { pageConfig } from "@/lib/page-config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-screen bg-sidebar">
      <div className="flex w-full flex-col bg-background p-8 xl:w-[600px] xl:shrink-0 xl:rounded-r-2xl xl:border-r xl:border-border/40 md:p-16">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex size-16 items-center justify-center overflow-hidden rounded-xl bg-muted/60 text-muted-foreground ring-1 ring-border/50">
              <AssistantLogo size={60} />
            </div>
            {children}
          </div>
        </div>
      </div>

      <div className="hidden flex-1 flex-col overflow-hidden pl-12 xl:flex">
        <div className="flex items-center gap-1.5 pt-8 text-[13px] text-muted-foreground/50">
          {pageConfig.brand.poweredByLabel}
          <AssistantLogo size={40} />
          <span className="font-medium text-muted-foreground">
            {pageConfig.brand.name}
          </span>
        </div>
        <div className="flex-1 pt-4">
          <Preview requiresAuth />
        </div>
      </div>
    </div>
  );
}
