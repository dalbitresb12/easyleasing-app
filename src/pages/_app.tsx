import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import { HttpError, HttpErrorCode } from "@/shared/api/types";
import { setupZodErrorMap } from "@/shared/utils/zod-errors";

import { useAuthGuard } from "@/utils/use-auth-guard";

import { Layout } from "../components/layout";
import "../css/base.css";

setupZodErrorMap();

const retryHandler = (_: number, error: unknown): boolean => {
  if (!(error instanceof HttpError)) return true;
  if (error.code === HttpErrorCode.ServerError) return true;
  if (error.code === HttpErrorCode.ClientError) return false;
  return true;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: retryHandler,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const MyApp: React.FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  useAuthGuard({
    onUnauthenticated: () => {
      if (router.pathname.startsWith("/auth")) return;
      router.push("/auth/login");
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default MyApp;
