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
