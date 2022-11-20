import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";

import { verifyEmailHandler } from "@/api/handlers";
import { takeFirstQuery } from "@/utils/query";
import { useAuthGuard } from "@/utils/use-auth-guard";

import UndrawMailSent from "../../../public/undraw_mail_sent_re_0ofv.svg";
import UndrawServerDown from "../../../public/undraw_server_down_s-4-lk.svg";

const VerifyEmailPage: FC = () => {
  const router = useRouter();

  const mutation = useMutation({ mutationFn: verifyEmailHandler });

  useAuthGuard({
    onAuthenticated: () => router.push("/"),
  });

  const email = takeFirstQuery(router.query.email);
  const code = takeFirstQuery(router.query.code);

  useEffect(() => {
    if (router.isReady && email && code && mutation.isIdle) {
      mutation.mutate({ email, code });
    }
  }, [router.isReady, mutation, email, code]);

  if (!router.isReady) {
    return null;
  }

  if (!email) {
    router.push("/");
    return null;
  }

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-full bg-sky-50 py-8">
        <h1 className="text-sky-700 text-xl font-bold mb-4">EasyLeasing</h1>
        <h2 className="text-gray-900 text-2xl font-bold mb-10">Verifica tu correo</h2>
        <div className="bg-white py-5 px-6 sm:py-9 sm:px-10 rounded-md shadow w-full max-w-md mx-4 space-y-6">
          <div className="flex justify-center">
            <UndrawMailSent viewBox="0 0 570 511.67482" className="w-auto h-36" />
          </div>
          <p className="text-center">
            Hemos enviado un correo de verificación a <span className="font-medium">{email}</span>.
          </p>
          <p className="text-center">Asegúrate de revisar la carpeta de no deseados (spam).</p>
          <Link href="/auth/login" className="flex justify-center">
            <span className="text-sky-700 hover:text-sky-900">Volver al inicio de sesión</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-sky-50 py-8">
      <h1 className="text-sky-700 text-xl font-bold mb-4">EasyLeasing</h1>
      <h2 className="text-gray-900 text-2xl font-bold mb-10">
        {mutation.isLoading ? "Verificando..." : mutation.isError ? "¡Uh-oh!" : "Verificado"}
      </h2>
      {!mutation.isLoading && (
        <div className="bg-white py-5 px-6 sm:py-9 sm:px-10 rounded-md shadow w-full max-w-md mx-4 space-y-6">
          <div className="flex justify-center">
            {mutation.isError ? (
              <UndrawServerDown viewBox="0 0 1119.60911 699" className="w-auto h-36" />
            ) : (
              <UndrawMailSent viewBox="0 0 570 511.67482" className="w-auto h-36" />
            )}
          </div>
          <p className="text-center">
            {mutation.isError
              ? "Ha sucedido un problema al intentar verificar tu correo. Intenta más tarde."
              : "Tu correo ha sido verificado. Ya puedes iniciar sesión."}
          </p>
          <Link href="/auth/login" className="flex justify-center">
            <span className="text-sky-700 hover:text-sky-900">
              {mutation.isError ? "Volver al inicio" : "Ir a inicio de sesión"}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;
