export interface CountryResponse {
  CountryRegionId: string;
  Description: string;
  ShortName: string;
}

export interface CountryResponseData {
  value: CountryResponse[];
}
