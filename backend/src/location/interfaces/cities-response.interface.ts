export interface CityResponse {
  CountryRegionId: string;
  StateId: string;
  CountyId: string;
  CityId: string;
  Name: string;
  // Add other city properties as needed
}

export interface CityResponseData {
  value: CityResponse[];
}
