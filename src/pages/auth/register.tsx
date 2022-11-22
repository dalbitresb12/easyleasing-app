import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { PulseLoader } from "react-spinners";
import { z } from "zod";

import { RegisterRequest } from "@/shared/api/types";

import { registerHandler } from "@/api/handlers";

import { FormButton } from "@/components/form-button";
import { FormInput } from "@/components/form-input";

import { useAuthGuard } from "@/utils/use-auth-guard";

const RegisterForm = RegisterRequest.extend({
  confirmation: RegisterRequest.shape.password,
}).superRefine(({ password, confirmation }, ctx) => {
  if (password !== confirmation) {
    ctx.addIssue({
      code: "custom",
      message: "Las contraseñas no coinciden",
      path: ["confirmation"],
    });
  }
});
type RegisterForm = z.infer<typeof RegisterForm>;

const RegisterPage: FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(RegisterForm) });

  const mutation = useMutation({
    mutationFn: registerHandler,
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

  const onSubmit = (form: RegisterForm) => {
    const data = RegisterRequest.parse(form);
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-sky-50 py-8 px-4">
      <h1 className="text-sky-700 text-xl font-bold mb-4">EasyLeasing</h1>
      <h2 className="text-gray-900 text-2xl font-bold ">Crea tu cuenta gratis</h2>
      <span className="mb-10 text-sm">
        O{" "}
        <Link href="/auth/login">
          <span className="text-sky-700">inicia sesión con tu cuenta</span>
        </Link>
      </span>
      <div className="bg-white py-5 px-6 sm:py-9 sm:px-10 rounded-md shadow w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8" noValidate>
          <div className="flex flex-col space-y-1">
            <FormInput
              type="text"
              disabled={mutation.isLoading}
              autoComplete="name"
              label="Nombre completo"
              errors={errors.fullName}
              {...register("fullName")}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <FormInput
              type="text"
              disabled={mutation.isLoading}
              autoComplete="nickname"
              label="¿Cómo prefieres que te llamemos?"
              errors={errors.preferredName}
              {...register("preferredName")}
            />
          </div>
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
              {mutation.isLoading ? <PulseLoader size="0.5rem" color="#fff" /> : "Crear cuenta"}
            </FormButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
