export interface VendorBankAccount {
  dataAreaId: string
  VendorAccountNumber: string
  BankAccountNumber: string
  BankAccountName: string
  BankName: string
  BankCode: string
  BankBranchCode: string
  BankAccountType: string
  BankIBAN: string
  BankSWIFTCode: string
  BankRoutingNumber: string
  IsActive: string
  IsPrimary: string
  CreatedDateTime: string
  ModifiedDateTime: string
}

export interface VendorBankAccountResponseData {
  value: VendorBankAccount[]
}
