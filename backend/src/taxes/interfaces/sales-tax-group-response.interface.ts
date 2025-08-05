export interface SalesTaxGroupResponse {
  dataAreaId: string;
  TaxGroup: string;
  Description: string;
}

export interface SalesTaxGroupResponseData {
  value: SalesTaxGroupResponse[];
}
