type GenericObject = { [key: string]: any };

export const pick = (passedObject: GenericObject, keys: string[]) => {
  return keys.reduce((obj: GenericObject, key: string): GenericObject => {
    if (
      passedObject &&
      Object.prototype.hasOwnProperty.call(passedObject, key)
    ) {
      obj[key] = passedObject[key];
    }
    return obj;
  }, {});
};

export const compareNames = (
  nameSet1: { firstName: string; lastName: string; middleName: string },
  nameSet2: { firstName: string; lastName: string; middleName: string }
): boolean => {
  const names1 = [
    nameSet1?.firstName.toLowerCase(),
    nameSet1?.lastName.toLowerCase(),
    nameSet1?.middleName.toLowerCase(),
  ];

  const names2 = [
    nameSet2.firstName.toLowerCase(),
    nameSet2.lastName.toLowerCase(),
    nameSet2.middleName.toLowerCase(),
  ];

  let matchCount = 0;

  for (const name1 of names1) {
    for (const name2 of names2) {
      if (name1 === name2) {
        matchCount++;
        break;
      }
    }
  }

  return matchCount >= 2;
};

// Fields that are always required
export const alwaysExpectedFields = ["verificationPlanId", "employeeType"];

// Personal info fields that should always be present
export const personalInfoFields = [
  "firstName",
  "lastName",
  "middleName",
  "jobTitle",
  "dateOfBirth",
  "jobAddressId",
  "phoneNumber",
];

export const personalInfoFieldsSendToEmployee = [
  "firstName",
  "lastName",
  "middleName",
  "jobTitle",
  "dateOfBirth",
  "phoneNumber",
];

// Personal info fields that should always be present
export const personalInfoFieldsBulk = [
  "firstName",
  "lastName",
  "middleName",
  "jobTitle",
  "dateOfBirth",
  "jobAddressId",
  "dateOfEmployment",
  "phoneNumber",
  "photoUrl",
];

// Mapping services to their expected input fields
const serviceFieldMappings: Record<string, string[]> = {
  NIN_VERIFICATION: ["nin"],
  BVN_VERIFICATION: ["bvn"],
  ADDRESS_VERIFICATION: [
    "residentialAddressState",
    "residentialAddressLga",
    "residentialAddressWard",
    "residentialAddress",
  ],
  PREVIOUS_EMPLOYMENT_VERIFICATION: [
    "employerName",
    "previousEmployerPhoneNumber",
    "companyName",
  ],
  STATE_OF_ORIGIN_VERIFICATION: [
    "stateOfOriginState",
    "stateOfOriginLga",
    "stateOfOriginWard",
    "stateOfOriginAddress",
  ],
  PASSPORT_VERIFICATION: ["passportNumber"],
};

const serviceFieldMappingsBulk: Record<string, string[]> = {
  NIN_VERIFICATION: ["nin"],
  BVN_VERIFICATION: ["bvn"],
  ADDRESS_VERIFICATION: [
    "residentialAddressState",
    "residentialAddressLga",
    "residentialAddressWard",
    "residentialAddress",
  ],
  PREVIOUS_EMPLOYMENT_VERIFICATION: [
    "employerName",
    "previousEmployerPhoneNumber",
    "companyName",
  ],
  STATE_OF_ORIGIN_VERIFICATION: [
    "stateOfOriginState",
    "stateOfOriginLga",
    "stateOfOriginWard",
    "stateOfOriginAddress",
  ],
  PASSPORT_VERIFICATION: ["passportNumber", "passportImageUrl"],
};

export const compareDates = (date1: string, date2: string): boolean => {
  console.log(`${date1}, ${date2}, 11111`);
  const formattedDate1 = new Date(date1);
  const formattedDate2 = new Date(date2);
  console.log(`${formattedDate1}, ${formattedDate2}, sdsdsd`);

  return formattedDate1.getTime() === formattedDate2.getTime();
};

export const getExpectedFieldsForPlan = (
  verificationPlan: any
): Set<string> => {
  const serviceCodes = verificationPlan.verificationServices.map(
    (service: any) => service.code
  );

  return new Set([
    ...alwaysExpectedFields,
    ...personalInfoFields,
    ...serviceCodes.flatMap((code: any) => serviceFieldMappings[code] || []),
  ]);
};

export const getExpectedFieldsForPlanSendToEmployee = (
  verificationPlan: any
): Set<string> => {
  const serviceCodes = verificationPlan.verificationServices.map(
    (service: any) => service.code
  );

  return new Set([
    ...alwaysExpectedFields,
    ...personalInfoFieldsSendToEmployee,
    ...serviceCodes.flatMap((code: any) => serviceFieldMappings[code] || []),
  ]);
};

export const getExpectedFieldsForPlanBulk = (
  verificationPlan: any
): Set<string> => {
  const serviceCodes = verificationPlan.verificationServices.map(
    (service: any) => service.code
  );

  return new Set([
    ...personalInfoFieldsBulk,
    ...serviceCodes.flatMap(
      (code: any) => serviceFieldMappingsBulk[code] || []
    ),
  ]);
};

export const validateRequiredFields = (
  body: Record<string, any>,
  requiredFields: Set<string>
): string[] => {
  return [...requiredFields].filter(
    (field) => !body[field] || body[field].toString().trim() === ""
  );
};

export const getNonEmptyFields = (body: Record<string, any>): string[] => {
  return Object.keys(body).filter(
    (field) => body[field] !== undefined && body[field] !== ""
  );
};

export const compareFields = (
  expectedFields: Set<string>,
  providedFields: string[]
) => {
  const extraFields = providedFields.filter(
    (field) => !expectedFields.has(field)
  );

  return extraFields;
};
