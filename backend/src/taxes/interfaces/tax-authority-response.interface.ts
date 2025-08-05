export interface TaxAuthorityResponse {
  dataAreaId: string;
  TaxAuthority: string;
  Name: string;
  SettlementPeriod: string;
}

export interface TaxAuthorityResponseData {
  value: TaxAuthorityResponse[];
}
