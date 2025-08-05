export interface AddressState {
  Name: string;
  CountryRegionId: string;
  State: string;
  IntrastatCode: string;
  TimeZone: null;
  BrazilStateCode: '';
  DefaultStateForCountryRegion: string;
}

export interface AddressStateResponse {
  value: AddressState[];
}
