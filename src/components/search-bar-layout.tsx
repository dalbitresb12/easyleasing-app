import SearchIcon from "@material-symbols/svg-400/rounded/search.svg";
import { FC, PropsWithChildren } from "react";

import { FormInput } from "./form-input";
import { MaterialIcon } from "./material-icon";

export const SearchBarLayout: FC<PropsWithChildren> = props => {
  return (
    <div className="px-8">
      <div className="group border-b border-slate-200 flex items-center">
        <MaterialIcon
          icon={SearchIcon}
          className="text-xl text-slate-500 mr-2 group-focus-within:text-gray-900 transition-colors"
        />
        <FormInput
          type="text"
          className="text-sm text-gray-900 placeholder:text-slate-500 focus:placeholder:text-gray-900 w-full h-full py-6 px-0 border-0 focus:outline-none focus:ring-0 transition-colors"
          spellCheck={true}
          placeholder="Buscar por nombre, monto y más"
          unstyled={true}
        />
      </div>
      <div className="mt-8">{props.children}</div>
    </div>
  );
};
