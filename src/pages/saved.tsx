import ChevronRightIcon from "@material-symbols/svg-400/rounded/chevron_right.svg";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FC } from "react";

import { createCurrencyFormatter } from "@/shared/utils/numbers";
import { pluralize } from "@/shared/utils/strings";

import { leasingsHandler } from "@/api/handlers/leasings";
import { queries } from "@/api/keys";

import { MaterialIcon } from "@/components/material-icon";
import { SearchBarLayout } from "@/components/search-bar-layout";

import { formatDate } from "@/utils/date-formatter";

const SavedPage: FC = () => {
  const query = useQuery({ ...queries.leasings.list, queryFn: leasingsHandler });

  if (query.isLoading) return <span>Loading...</span>;

  if (query.isError) return <span>Error</span>;

  const { data: leasings } = query.data;

  return (
    <SearchBarLayout>
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-slate-900">Guardados</h2>
        <span className="text-slate-500 mt-1">
          {leasings.length} {pluralize(leasings.length, "elemento", "s")}
        </span>
      </div>
      <div className="divide-y divide-slate-200 mt-4">
        {leasings.map(item => (
          <Link
            key={item.id}
            href={{ pathname: "/leasings/details", query: { id: item.id } }}
            className="flex items-center py-4"
          >
            <div className="w-full h-full flex flex-col">
              <span className="text-sm text-sky-700 font-semibold">{item.name}</span>
              <span className="text-xs text-slate-500 font-light mt-2">{formatDate(item.createdAt)}</span>
            </div>
            <div className="w-full h-full flex justify-center items-center">
              <span className="text-sm text-slate-900">
                {createCurrencyFormatter(item.currency).format(item.sellingPrice)}
              </span>
            </div>
            <div className="w-full h-full flex justify-end">
              <MaterialIcon icon={ChevronRightIcon} className="text-sky-700 text-2xl" />
            </div>
          </Link>
        ))}
      </div>
    </SearchBarLayout>
  );
};

export default SavedPage;
