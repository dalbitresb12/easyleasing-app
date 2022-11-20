import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PulseLoader } from "react-spinners";

import { sendResetPasswordHandler } from "@/api/handlers";
import { FormButton } from "@/components/form-button";
import { FormInput } from "@/components/form-input";
import { SendResetPasswordRequest } from "@/shared/api/types";
import { takeFirstQuery } from "@/utils/query";
import { useAuthGuard } from "@/utils/use-auth-guard";

const SendResetPasswordPage: FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SendResetPasswordRequest>({ resolver: zodResolver(SendResetPasswordRequest) });

  const mutation = useMutation({
    mutationFn: sendResetPasswordHandler,
    onSuccess: (_, variables) => {
      router.push({
        pathname: "/auth/verify-email",
        query: { email: variables.email },
      });
    },
  });

  useAuthGuard({
    onAuthenticated: () => router.push("/"),
  });

  const email = takeFirstQuery(router.query.email);

  useEffect(() => {
    const state = getValues("email");
    if (router.isReady && email && state.length === 0) {
      setValue("email", email);
    }
  }, [router.isReady, email, setValue, getValues]);

  const onSubmit = (data: SendResetPasswordRequest) => {
    mutation.mutate(data);
  };

  if (!router.isReady) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-sky-50 py-8">
      <h1 className="text-sky-700 text-xl font-bold mb-4">EasyLeasing</h1>
      <h2 className="text-gray-900 text-2xl font-bold mb-10">Olvidaste tu contraseña</h2>
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

export default SendResetPasswordPage;
