import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";

import {
  getAnnualPayments,
  getBuyingOptionFee,
  getDepreciation,
  getIgvFee,
  getInitialCosts,
  getInitialFee,
  getInterestRatePerPeriod,
  getNewSellingPrice,
  getPeriodicalCosts,
  getPeriods,
  getSellingValue,
} from "@/shared/finance/initial-data";
import { generatePaymentSchedule } from "@/shared/finance/payment-calculations";
import { localizeGracePeriod } from "@/shared/models/common";
import { createCurrencyFormatter } from "@/shared/utils/numbers";
import { capitalize } from "@/shared/utils/strings";

import { leasingGetHandler } from "@/api/handlers/leasings";
import { queries } from "@/api/keys";

import { FormButton } from "@/components/form-button";
import { SearchBarLayout } from "@/components/search-bar-layout";

import { takeFirstQuery } from "@/utils/query";

const LeasingsSchedulePage: FC = () => {
  const router = useRouter();
  const id = takeFirstQuery(router.query.id);

  const query = useQuery(!id ? {} : { ...queries.leasings.getById(id), queryFn: () => leasingGetHandler(id) });

  if (query.isLoading) return <span>Loading...</span>;

  if (query.isError) return <span>Error</span>;

  const { data: leasing } = query;

  const currencyFormatter = createCurrencyFormatter(leasing.currency);

  const periods = getPeriods(leasing.leasingTime, leasing.paymentFrequency);
  const interestRatePerPeriod = getInterestRatePerPeriod(
    leasing.rateType,
    leasing.rateValue,
    leasing.rateFrequency,
    leasing.paymentFrequency,
    leasing.capitalizationFrequency,
  );

  const initialFee = getInitialFee(leasing.percentageInitialFee, leasing.sellingPrice);
  const newSellingPrice = getNewSellingPrice(leasing.sellingPrice, initialFee);
  const igvFee = getIgvFee(newSellingPrice);
  const sellingValue = getSellingValue(newSellingPrice, igvFee);

  const initialCosts = getInitialCosts(newSellingPrice, leasing.extras);

  const annualPayments = getAnnualPayments(leasing.paymentFrequency);
  const periodicalCosts = getPeriodicalCosts(leasing.extras, newSellingPrice, annualPayments);

  const depreciation = getDepreciation(sellingValue, periods);

  const buybackFee = getBuyingOptionFee(leasing.buyback, leasing.buybackValue ?? 0, sellingValue);

  const paymentSchedule = generatePaymentSchedule(
    leasing.gracePeriods,
    periods,
    interestRatePerPeriod,
    sellingValue,
    initialCosts,
    periodicalCosts,
    depreciation,
    buybackFee,
  );

  return (
    <SearchBarLayout>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Cronograma de pagos</h2>
          <span className="text-sm text-slate-500 mt-1">
            Utiliza las barras de navegación para moverte en la tabla. Todos los valores están mostrados en{" "}
            {leasing.currency} excepto donde se mencione.
          </span>
        </div>
        <div>
          <Link href={{ pathname: "/leasings/details", query: { id } }}>
            <FormButton type="button" style="secondary" className="max-w-fit whitespace-nowrap">
              Resumen
            </FormButton>
          </Link>
        </div>
      </div>
      <div className="overflow-auto mb-6 max-h-[90vh]">
        <table className="min-w-fit table-auto border-collapse">
          <thead className="border-b-2 border-slate-300">
            <tr className="text-sm text-slate-700 font-semibold">
              {[
                "N°",
                "Periodo de gracia",
                "Saldo inicial",
                "Intereses",
                "Cuota",
                "Amortización",
                "Costos periódicos",
                "Recompra",
                "Saldo final",
                "Depreciación",
                "Ahorro tributario",
                "IGV",
                "Flujo Bruto",
                "Flujo IGV",
                "Flujo Neto",
              ].map(h => (
                <th key={h} className="whitespace-nowrap py-2 px-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paymentSchedule.map(item => (
              <tr key={item.period} className="text-sm text-slate-700 border-y last:border-b-0 border-slate-200">
                <td className="whitespace-nowrap py-2 px-4 text-center">{item.period}</td>
                <td className="whitespace-nowrap py-2 px-4 text-center">
                  {capitalize(localizeGracePeriod(item.gracePeriod).charAt(0))}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-right">
                  {currencyFormatter.format(item.initialBalance)}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-right">{currencyFormatter.format(item.interest)}</td>
                <td className="whitespace-nowrap py-2 px-4 text-right">{currencyFormatter.format(item.fee)}</td>
                <td className="whitespace-nowrap py-2 px-4 text-right">
                  {currencyFormatter.format(item.amortization)}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-right">
                  {currencyFormatter.format(item.periodicalCosts)}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-right">
                  {currencyFormatter.format(item.buyingOptionFee)}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-right">
                  {currencyFormatter.format(item.finalBalance)}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-right">
                  {currencyFormatter.format(item.depreciation)}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-right">{currencyFormatter.format(item.taxSavings)}</td>
                <td className="whitespace-nowrap py-2 px-4 text-right">{currencyFormatter.format(item.IGV)}</td>
                <td className="whitespace-nowrap py-2 px-4 text-right">{currencyFormatter.format(item.grossFlow)}</td>
                <td className="whitespace-nowrap py-2 px-4 text-right">
                  {currencyFormatter.format(item.flowWithTaxes)}
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-right">{currencyFormatter.format(item.netFlow)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SearchBarLayout>
  );
};

export default LeasingsSchedulePage;
