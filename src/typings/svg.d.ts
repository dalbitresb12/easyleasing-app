import type { FC, SVGProps } from "react";

declare module "*.svg" {
  const content: FC<SVGProps<SVGElement>>;
  export default content;
}

export type ReactSVGElement = FC<SVGProps<SVGElement>>;
