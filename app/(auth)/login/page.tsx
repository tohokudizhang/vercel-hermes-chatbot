"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";

import { AuthForm } from "@/components/chat/auth-form";
import { SubmitButton } from "@/components/chat/submit-button";
import { toast } from "@/components/chat/toast";
import { pageConfig } from "@/lib/page-config";
import { type LoginActionState, login } from "../actions";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "failed") {
      toast({ type: "error", description: pageConfig.auth.notifications.invalidCredentials });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: pageConfig.auth.notifications.validationFailed,
      });
    } else if (state.status === "success") {
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
        {pageConfig.auth.login.title}
      </h1>
      <p className="text-sm text-muted-foreground">
        {pageConfig.auth.login.subtitle}
      </p>
      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>
          {pageConfig.auth.login.submitLabel}
        </SubmitButton>
        <p className="text-center text-[13px] text-muted-foreground">
          {pageConfig.auth.login.switchPrompt}
          <Link
            className="text-foreground underline-offset-4 hover:underline"
            href="/register"
          >
            {pageConfig.auth.login.switchLabel}
          </Link>
        </p>
      </AuthForm>
    </>
  );
}
