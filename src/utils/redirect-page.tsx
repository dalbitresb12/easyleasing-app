import { useRouter } from "next/router";
import { FC, useEffect } from "react";

export const createRedirectPage = (path: string): FC => {
  return () => {
    const router = useRouter();

    useEffect(() => {
      router.replace(path);
    });

    return null;
  };
};
