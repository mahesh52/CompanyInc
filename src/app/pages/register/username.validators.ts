import { FormControl, ValidationErrors } from '@angular/forms';

const ALPHA_NUMERIC_REGEX = /^[a-zA-Z0-9]*$/;
const NUMERIC_REGEX = /^[0-9]+$/;
const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
const ALPHA_NUMERIC_VALIDATION_ERROR = { alphaNumericError: 'only alpha numeric values are allowed' }
const NUMERIC_VALIDATION_ERROR = { NumericError: 'Only numbers allowed' }
const EXPIRY_VALIDATION_ERROR = { expiryError: 'Only numbers allowed' }

export const alphaNumericValidator =  function (control: FormControl): ValidationErrors | null {
  return ALPHA_NUMERIC_REGEX.test(control.value) ? null : ALPHA_NUMERIC_VALIDATION_ERROR;
}

export const onlyNumericValidator =  function (control: FormControl): ValidationErrors | null {
  return NUMERIC_REGEX.test(control.value) ? null : NUMERIC_VALIDATION_ERROR;
}
export const expiryDatevalidator =  function (control: FormControl): ValidationErrors | null {
  return EXPIRY_REGEX.test(control.value) ? null : EXPIRY_VALIDATION_ERROR;
}
