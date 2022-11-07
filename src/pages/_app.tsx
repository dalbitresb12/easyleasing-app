import type { AppProps } from "next/app";
import "../css/base.css";

const MyApp: React.FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
