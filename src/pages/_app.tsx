import type { AppProps } from "next/app";
import { Layout } from "../components/layout";
import "../css/base.css";

const MyApp: React.FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default MyApp;
