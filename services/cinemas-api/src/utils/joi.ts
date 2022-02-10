import { ValidationError, ValidationErrorItem } from 'joi';

export const joiErrToStr = (val: ValidationError): string => {
  const msgs = val.details.map(joiErrDetailItemToStr);
  return msgs.join('; ');
};

const joiErrDetailItemToStr = (val: ValidationErrorItem): string => {
  const { message, path, context } = val;
  const pathStr = path.map(itm => `${itm}`).join('.');
  return `${message} (path=${pathStr}, context=${JSON.stringify(context)})`;
};
