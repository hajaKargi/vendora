export interface PaymentTermResponse {
  dataAreaId: string;
  PaymentTermId: string;
  Description: string;
}

export interface PaymentTermResponseData {
  value: PaymentTermResponse[];
}
