import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { PulseLoader } from "react-spinners";
import { UrlObject } from "url";

import { loginHandler } from "@/api/handlers";
import { queries } from "@/api/keys";
import { FormButton } from "@/components/form-button";
import { FormInput } from "@/components/form-input";
import { LoginRequest } from "@/shared/api/types";
import { useAuthGuard } from "@/utils/use-auth-guard";

const LoginPage: FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequest),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

  const onSubmit = (data: LoginRequest) => {
    mutation.mutate(data);
  };

  const email = watch("email");
  const getResetPasswordUrl = (): UrlObject | string => {
    if (email.length > 0) {
      return {
        pathname: "/auth/send-reset-password",
        query: { email },
      };
    }
    return "/auth/send-reset-password";
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-sky-50 py-8">
      <h1 className="text-sky-700 text-xl font-bold mb-4">EasyLeasing</h1>
      <h2 className="text-gray-900 text-2xl font-bold ">Inicia sesión en tu cuenta</h2>
      <span className="mb-10 text-sm">
        O{" "}
        <Link href="/auth/register">
          <span className="text-sky-700">crea tu cuenta gratuita aquí</span>
        </Link>
      </span>
      <div className="bg-white py-5 px-6 sm:py-9 sm:px-10 rounded-md shadow w-full max-w-md mx-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8" noValidate>
          <div className="flex flex-col space-y-1">
            <FormInput
              type="email"
              disabled={mutation.isLoading}
              autoComplete="email"
              spellCheck={false}
              label="Email"
              errors={errors.email}
              {...register("email")}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <FormInput
              type="password"
              disabled={mutation.isLoading}
              autoComplete="current-password"
              spellCheck={false}
              label="Contraseña"
              errors={errors.password}
              {...register("password")}
            />
          </div>

          <div className="flex flex-col space-y-4">
            <FormButton type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? <PulseLoader size="0.5rem" color="#fff" /> : "Iniciar sesión"}
            </FormButton>
            <Link href={getResetPasswordUrl()}>
              <FormButton type="button" style="text" padding={false}>
                ¿Olvidaste tu contraseña?
              </FormButton>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
