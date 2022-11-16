import { FC, SVGProps } from "react";

export interface Props extends SVGProps<SVGElement> {
  icon: FC<SVGProps<SVGElement>>;
}

export const MaterialIcon: FC<Props> = props => {
  const { icon: Icon, ...attrs } = props;
  return <Icon viewBox="0 0 48 48" {...attrs} />;
};
