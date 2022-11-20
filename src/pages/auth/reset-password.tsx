import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PulseLoader } from "react-spinners";
import { z } from "zod";

import { ResetPasswordRequest } from "@/shared/api/types";

import { resetPasswordHandler } from "@/api/handlers";

import { FormButton } from "@/components/form-button";
import { FormInput } from "@/components/form-input";

import { takeFirstQuery } from "@/utils/query";
import { useAuthGuard } from "@/utils/use-auth-guard";

import UndrawAuthentication from "../../../public/undraw_authentication_re_svpt.svg";
import UndrawServerDown from "../../../public/undraw_server_down_s-4-lk.svg";

const ResetPasswordForm = ResetPasswordRequest.extend({
  confirmation: ResetPasswordRequest.shape.password,
}).superRefine(({ password, confirmation }, ctx) => {
  if (password !== confirmation) {
    ctx.addIssue({
      code: "custom",
      message: "Las contraseñas no coinciden",
      path: ["confirmation"],
    });
  }
});
type ResetPasswordForm = z.infer<typeof ResetPasswordForm>;

const ResetPasswordPage: FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(ResetPasswordForm) });

  const mutation = useMutation({
    mutationFn: resetPasswordHandler,
  });

  useAuthGuard({
    onAuthenticated: () => router.push("/"),
  });

  const email = takeFirstQuery(router.query.email);
  const code = takeFirstQuery(router.query.code);

  useEffect(() => {
    if (router.isReady && email && code) {
      setValue("email", email);
      setValue("code", code);
    } else if (router.isReady && (!email || !code)) {
      router.push("/auth/login");
    }
  }, [router.isReady, email, code, setValue, router]);

  const onSubmit = (form: ResetPasswordForm) => {
    const data = ResetPasswordRequest.parse(form);
    mutation.mutate(data);
  };

  if (!router.isReady) {
    return null;
  }

  if (mutation.isSuccess || mutation.isError) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-full bg-sky-50 py-8 px-4">
        <h1 className="text-sky-700 text-xl font-bold mb-4">EasyLeasing</h1>
        <h2 className="text-gray-900 text-2xl font-bold mb-10">Cambio de contraseña</h2>
        <div className="bg-white py-5 px-6 sm:py-9 sm:px-10 rounded-md shadow w-full max-w-md space-y-6">
          <div className="flex justify-center">
            {mutation.isError ? (
              <UndrawServerDown viewBox="0 0 1119.60911 699" className="w-auto h-36" />
            ) : (
              <UndrawAuthentication viewBox="0 0 543.21934 633.6012" className="w-auto h-36" />
            )}
          </div>
          <p className="text-center">
            {mutation.isError
              ? "Ha sucedido un problema al intentar cambiar tu contraseña. Intenta más tarde."
              : "Se ha actualizado tu contraseña satisfactoriamente. Ya puedes iniciar sesión."}
          </p>
          <Link href="/auth/login" className="flex justify-center">
            <span className="text-sky-700 hover:text-sky-900">
              {mutation.isError ? "Volver al inicio" : "Ir a inicio de sesión"}
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-sky-50 py-8">
      <h1 className="text-sky-700 text-xl font-bold mb-4">EasyLeasing</h1>
      <h2 className="text-gray-900 text-2xl font-bold mb-10">Cambio de contraseña</h2>
      <div className="bg-white py-5 px-6 sm:py-9 sm:px-10 rounded-md shadow w-full max-w-md mx-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8" noValidate>
          <div className="flex flex-col space-y-1">
            <FormInput
              type="email"
              disabled={true}
              autoComplete="email"
              spellCheck={false}
              label="Email"
              errors={errors.email}
              {...register("email")}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <FormInput
              type="text"
              disabled={true}
              autoComplete="off"
              spellCheck={false}
              label="Código de verificación"
              errors={errors.code}
              {...register("code")}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <FormInput
              type="password"
              disabled={mutation.isLoading}
              autoComplete="new-password"
              spellCheck={false}
              label="Contraseña"
              errors={errors.password}
              {...register("password")}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <FormInput
              type="password"
              disabled={mutation.isLoading}
              autoComplete="new-password"
              spellCheck={false}
              label="Confirma tu contraseña"
              errors={errors.confirmation}
              {...register("confirmation")}
            />
          </div>

          <div className="flex flex-col space-y-4">
            <FormButton type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? <PulseLoader size="0.5rem" color="#fff" /> : "Enviar"}
            </FormButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
