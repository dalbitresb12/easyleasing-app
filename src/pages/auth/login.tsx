import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { FormEventHandler, useId, useRef, FC } from "react";

import { loginHandler } from "@/api/handlers";
import { useAuthGuard } from "@/utils/use-auth-guard";
import { queries } from "@/api/keys";

const LoginPage: FC = () => {
  const router = useRouter();
  const emailInputId = useId();
  const passwordInputId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: loginHandler,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ ...queries.users._def });
      router.push("/");
    },
  });

  useAuthGuard({
    onAuthenticated: () => router.push("/"),
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    if (!formRef.current) return;
    const inputs = new FormData(formRef.current);
    const email = inputs.get("email")?.toString() ?? "";
    const password = inputs.get("password")?.toString() ?? "";
    mutation.mutate({ email, password });
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="flex flex-col space-y-1">
          <label htmlFor={emailInputId}>Email</label>
          <input id={emailInputId} name="email" type="text" disabled={mutation.isLoading} />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor={passwordInputId}>Password</label>
          <input id={passwordInputId} name="password" type="password" disabled={mutation.isLoading} />
        </div>
        <button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
