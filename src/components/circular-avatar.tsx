import clsx from "clsx";
import { FC } from "react";

export interface Props {
  placeholder?: string;
  picture?: string;
  alt?: string;
  className?: string;
  divClassName?: string;
  placeholderContainerClassName?: string;
  placeholderClassName?: string;
}

export const CircularAvatar: FC<Props> = props => {
  const { placeholder, picture, alt, className, divClassName, placeholderContainerClassName, placeholderClassName } =
    props;

  const letter = placeholder?.charAt(0).toUpperCase();

  return (
    <div className={clsx(divClassName, "aspect-square rounded-full w-12 h-12 overflow-hidden shrink-0")}>
      {picture ? (
        <img className={clsx(className, "h-full object-cover")} alt={alt} src={picture} />
      ) : (
        <div
          className={clsx(placeholderContainerClassName, "bg-sky-700 w-full h-full flex items-center justify-center")}
        >
          {letter && <span className={clsx(placeholderClassName, "text-white text-xl")}>{letter}</span>}
        </div>
      )}
    </div>
  );
};
