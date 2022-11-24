import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

import {
  getAnnualPayments,
  getBuyingOptionFee,
  getDepreciation,
  getExtraValueByPercentage,
  getIgvFee,
  getInitialCosts,
  getInitialFee,
  getInterestRatePerPeriod,
  getLeasingAmount,
  getNewSellingPrice,
  getPeriodicalCosts,
  getPeriods,
  getSellingValue,
} from "@/shared/finance/initial-data";
import { getGrossFlows, getLeasingResults, getNetFlows } from "@/shared/finance/leasing-results";
import { generatePaymentSchedule } from "@/shared/finance/payment-calculations";
import { vnaCalculation, tirCalculation, tceaCalculation } from "@/shared/finance/profitability-indicators";
import { effectiveToEffectiveRate } from "@/shared/finance/rate-conversion";
import { localizeTimeFrequency } from "@/shared/models/common";
import { createCurrencyFormatter, percentFormatter } from "@/shared/utils/numbers";
import { capitalize, pluralize } from "@/shared/utils/strings";

import { leasingGetHandler } from "@/api/handlers/leasings";
import { queries } from "@/api/keys";

import { DividedTable, DividedTableItem } from "@/components/divided-table";
import { SearchBarLayout } from "@/components/search-bar-layout";

import { takeFirstQuery } from "@/utils/query";

const LeasingsDetailsPage: FC = () => {
  const router = useRouter();
  const id = takeFirstQuery(router.query.id);

  const [currencyFormatter, setCurrencyFormatter] = useState<Intl.NumberFormat>();

  const formatCurrency = (value: number): string => {
    return currencyFormatter?.format(value) ?? value.toString();
  };

  const query = useQuery(!id ? {} : { ...queries.leasings.getById(id), queryFn: () => leasingGetHandler(id) });

  useEffect(() => {
    if (query.data?.currency) {
      setCurrencyFormatter(createCurrencyFormatter(query.data.currency));
    }
  }, [query.data?.currency]);

  if (query.isLoading) return <span>Loading...</span>;

  if (query.isError) return <span>Error</span>;

  const { data: leasing } = query;
  const initialFee = getInitialFee(leasing.percentageInitialFee, leasing.sellingPrice);
  const newSellingPrice = getNewSellingPrice(leasing.sellingPrice, initialFee);
  const igvFee = getIgvFee(newSellingPrice);
  const sellingValue = getSellingValue(newSellingPrice, igvFee);
  const annualPayments = getAnnualPayments(leasing.paymentFrequency);
  const periods = getPeriods(leasing.leasingTime, leasing.paymentFrequency);

  const buybackFee = getBuyingOptionFee(leasing.buyback, leasing.buybackValue ?? 0, sellingValue);

  const depreciation = getDepreciation(sellingValue, periods);
  const initialCosts = getInitialCosts(newSellingPrice, leasing.extras);
  const periodicalCosts = getPeriodicalCosts(leasing.extras, newSellingPrice, annualPayments);

  const leasingAmount = getLeasingAmount(initialCosts, sellingValue);

  const interestRatePerPeriod = getInterestRatePerPeriod(
    leasing.rateType,
    leasing.rateValue,
    leasing.rateFrequency,
    leasing.paymentFrequency,
    leasing.capitalizationFrequency,
  );

  const ksRate = effectiveToEffectiveRate(leasing.ksRate, 360, leasing.paymentFrequency);
  const waccRate = effectiveToEffectiveRate(leasing.waccRate, 360, leasing.paymentFrequency);

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

  const grossFlows = getGrossFlows(leasingAmount, paymentSchedule);
  const netFlows = getNetFlows(leasingAmount, paymentSchedule);

  const leasingResults = getLeasingResults(paymentSchedule, buybackFee);

  const grossFlowsVna = vnaCalculation(grossFlows, ksRate);
  const netFlowsVna = vnaCalculation(netFlows, waccRate);

  const grossFlowsTir = tirCalculation(grossFlows);
  const netFlowsTir = tirCalculation(netFlows);

  const grossFlowsTcea = tceaCalculation(grossFlowsTir, annualPayments);
  const netFlowsTcea = tceaCalculation(netFlowsTir, annualPayments);

  return (
    <SearchBarLayout>
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-slate-800">{leasing.name}</h2>
      </div>
      <DividedTable>
        <DividedTableItem label="Frecuencia de pagos">
          {capitalize(localizeTimeFrequency(leasing.paymentFrequency))}
        </DividedTableItem>
        <DividedTableItem label="Tasa de interés equivalente">
          {percentFormatter.format(interestRatePerPeriod)}
        </DividedTableItem>
        <DividedTableItem label="Valor de venta">{formatCurrency(sellingValue)}</DividedTableItem>
        <DividedTableItem label="Cuotas totales">
          {periods} {pluralize(periods, "cuota", "s")}
        </DividedTableItem>
        <DividedTableItem label="Monto del leasing">{formatCurrency(leasingAmount)}</DividedTableItem>
      </DividedTable>
      <div className="mb-4 mt-8">
        <h2 className="text-2xl font-medium text-slate-800">Costos periódicos</h2>
        <span className="text-sm text-slate-500">Todo lo que será pagado en cada periodo lo podrás ver aquí.</span>
      </div>
      <DividedTable>
        {leasing.extras
          .filter(i => i.expenseType === "recurrent")
          .map(i => {
            const extraValueByPercentage = getExtraValueByPercentage(i.value, newSellingPrice);
            const valuePeriod = i.valueType === "percent" ? extraValueByPercentage / annualPayments : i.value;
            const valueTotal = (i.valueType === "percent" ? valuePeriod : i.value) * periods;
            const displayValuePeriod = formatCurrency(valuePeriod);
            const displayValueTotal = formatCurrency(valueTotal);

            return (
              <DividedTableItem key={i.name} label={capitalize(i.name)}>
                {displayValuePeriod}/periodo ({displayValueTotal} en total)
              </DividedTableItem>
            );
          })}
      </DividedTable>
      <div className="mb-4 mt-8">
        <h2 className="text-2xl font-medium text-slate-800">Totales</h2>
        <span className="text-sm text-slate-500">Subtotales de todo lo que tendrás que pagar.</span>
      </div>
      <DividedTable>
        <DividedTableItem label="Intereses">{formatCurrency(Math.abs(leasingResults.totalInterest))}</DividedTableItem>
        <DividedTableItem label="Amortización del capital">
          {formatCurrency(Math.abs(leasingResults.totalAmortization))}
        </DividedTableItem>
        <DividedTableItem label="Costos periódicos">
          {formatCurrency(Math.abs(leasingResults.totalPeriodicalCosts))}
        </DividedTableItem>
        <DividedTableItem label="Recompra">{formatCurrency(Math.abs(buybackFee))}</DividedTableItem>
        <DividedTableItem label="Desembolso">{formatCurrency(Math.abs(leasingResults.totalPayment))}</DividedTableItem>
      </DividedTable>
      <div className="mb-4 mt-8">
        <h2 className="text-2xl font-medium text-slate-800">Indicadores de rentabilidad</h2>
        <span className="text-sm text-slate-500">Medidas de beneficio o pérdida como resultado de la operación.</span>
      </div>
      <DividedTable className="mb-4">
        <DividedTableItem label="TCEA Flujo Bruto">{percentFormatter.format(grossFlowsTcea)}</DividedTableItem>
        <DividedTableItem label="TCEA Flujo Neto">{percentFormatter.format(netFlowsTcea)}</DividedTableItem>
        <DividedTableItem label="VAN Flujo Bruto">{formatCurrency(grossFlowsVna)}</DividedTableItem>
        <DividedTableItem label="VAN Flujo Neto">{formatCurrency(netFlowsVna)}</DividedTableItem>
        <DividedTableItem label="TIR Flujo Bruto">{percentFormatter.format(grossFlowsTir)}</DividedTableItem>
        <DividedTableItem label="TIR Flujo Neto">{percentFormatter.format(netFlowsTir)}</DividedTableItem>
      </DividedTable>
    </SearchBarLayout>
  );
};

export default LeasingsDetailsPage;
