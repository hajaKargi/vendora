export interface VendorGroup {
  VendorGroupId: string;
  Description: string;
  dataAreaId: string;
  DefaultTaxGroupCode: string;
  AccountingCurrencyExchangeRateType: string;
  DefaultPaymentTermName: string;
  VendorAccountNumberSequence: string;
  ClearingPeriodPaymentTermName: string;
  IsExcludedFromSearchResults: string;
  ReportingCurrencyExchangeRateType: string;
  DefaultDimensionDisplayValue: string;
  IsPublicSector_IT: string;
}

export interface VendorGroupResponse {
  value: VendorGroup[];
}
