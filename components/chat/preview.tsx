"use client";

import { useRouter } from "next/navigation";
import { pageConfig } from "@/lib/page-config";
import { toast } from "./toast";
import { AssistantLogo } from "./icons";

export function Preview({ requiresAuth = false }: { requiresAuth?: boolean }) {
  const router = useRouter();

  const handleAction = (query?: string) => {
    if (requiresAuth) {
      toast({
        type: "error",
        description: pageConfig.chat.signInRequiredMessage,
      });
      return;
    }

    const url = query ? `/?query=${encodeURIComponent(query)}` : "/";
    router.push(url);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-tl-2xl bg-background">
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-border/20 px-5">
        <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-muted/60 ring-1 ring-border/50">
          <AssistantLogo size={44} />
        </div>
        <span className="text-[13px] text-muted-foreground">
          {pageConfig.brand.productName}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            {pageConfig.chat.greetingTitle}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {pageConfig.chat.greetingSubtitle}
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-2">
          {pageConfig.chat.suggestions.map((suggestion) => (
            <button
              className="rounded-xl border border-border/30 bg-card/20 px-3 py-2.5 text-left text-[11px] leading-relaxed text-muted-foreground/70 transition-all duration-200 hover:border-border/60 hover:bg-card/40 hover:text-muted-foreground"
              key={suggestion}
              onClick={() => handleAction(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-5 pb-5">
        <button
          className="flex w-full items-center rounded-2xl border border-border/30 bg-card/30 px-4 py-3 text-left text-[13px] text-muted-foreground/40 transition-colors hover:border-border/50 hover:text-muted-foreground/60"
          onClick={() => handleAction()}
          type="button"
        >
          {requiresAuth
            ? pageConfig.chat.signedOutPlaceholder
            : pageConfig.chat.askPlaceholder}
        </button>
      </div>
    </div>
  );
}
