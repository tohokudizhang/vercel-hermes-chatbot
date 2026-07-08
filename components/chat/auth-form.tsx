import Form from "next/form";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { pageConfig } from "@/lib/page-config";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  showInviteCode = false,
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  showInviteCode?: boolean;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label className="font-normal text-muted-foreground" htmlFor="email">
          {pageConfig.auth.form.emailLabel}
        </Label>
        <Input
          autoComplete="email"
          autoFocus
          className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
          defaultValue={defaultEmail}
          id="email"
          name="email"
          placeholder={pageConfig.auth.form.emailPlaceholder}
          required
          type="email"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="font-normal text-muted-foreground" htmlFor="password">
          {pageConfig.auth.form.passwordLabel}
        </Label>
        <Input
          className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
          id="password"
          name="password"
          placeholder={pageConfig.auth.form.passwordPlaceholder}
          required
          type="password"
        />
      </div>

      {showInviteCode && (
        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-muted-foreground"
            htmlFor="inviteCode"
          >
            {pageConfig.auth.form.inviteCodeLabel}
          </Label>
          <Input
            autoComplete="off"
            className="h-10 rounded-lg border-border/50 bg-muted/50 text-sm transition-colors focus:border-foreground/20 focus:bg-muted"
            id="inviteCode"
            name="inviteCode"
            placeholder={pageConfig.auth.form.inviteCodePlaceholder}
            required
            type="text"
          />
        </div>
      )}

      {children}
    </Form>
  );
}
