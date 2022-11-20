import { useRouter } from "next/router";

import { useAuthGuard } from "@/utils/use-auth-guard";

const HomePage: React.FunctionComponent = () => {
  const router = useRouter();

  useAuthGuard({
    onAuthenticated: () => router.push("/saved"),
  });

  return null;
};

export default HomePage;
