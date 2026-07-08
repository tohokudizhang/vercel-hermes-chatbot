"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { AuthForm } from "@/components/chat/auth-form";
import { SubmitButton } from "@/components/chat/submit-button";
import { toast } from "@/components/chat/toast";
import { pageConfig } from "@/lib/page-config";
import { type RegisterActionState, register } from "../actions";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "user_exists") {
      toast({ type: "error", description: pageConfig.auth.notifications.accountExists });
    } else if (state.status === "failed") {
      toast({ type: "error", description: pageConfig.auth.notifications.createAccountFailed });
    } else if (state.status === "invalid_invite_code") {
      toast({ type: "error", description: pageConfig.auth.notifications.invalidInviteCode });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: pageConfig.auth.notifications.validationFailed,
      });
    } else if (state.status === "success") {
      toast({ type: "success", description: pageConfig.auth.notifications.accountCreated });
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        {pageConfig.auth.register.title}
      </h1>
      <p className="text-sm text-muted-foreground">
        {pageConfig.auth.register.subtitle}
      </p>
      <AuthForm action={handleSubmit} defaultEmail={email} showInviteCode>
        <SubmitButton isSuccessful={isSuccessful}>
          {pageConfig.auth.register.submitLabel}
        </SubmitButton>
        <p className="text-center text-[13px] text-muted-foreground">
          {pageConfig.auth.register.switchPrompt}
          <Link
            className="text-foreground underline-offset-4 hover:underline"
            href="/login"
          >
            {pageConfig.auth.register.switchLabel}
          </Link>
        </p>
      </AuthForm>
    </>
  );
}
