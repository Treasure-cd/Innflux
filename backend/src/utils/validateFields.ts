export type Validator = (value: unknown) => string | null;
export type FieldValidators = Record<string, Validator[]>;

export const isString: Validator = (v) =>
  typeof v === "string" ? null : "must be a string";

export const isValidEmail: Validator = (v) => 
    typeof v === "string" && /^\S+@\S+\.\S+$/.test(v)? null : "Email is invalid";


export const isValidUsername: Validator = (v) =>
  typeof v === "string" && /^[a-zA-Z0-9_]+$/.test(v)
    ? null
    : "Username contains invalid characters";

export const minLength = (min: number): Validator => (v) =>
  typeof v === "string" && v.length >= min
    ? null
    : `must be at least ${min} characters`;

export const isValidTimezone: Validator = (v) =>
  typeof v === "string" &&
  Intl.supportedValuesOf("timeZone").includes(v)
    ? null
    : "Invalid timezone";


    
export function validate(
  data: Record<string, unknown>,
  rules: FieldValidators
) {
  const errors: Record<string, string> = {};

  for (const field in rules) {
    const value = data[field];
    if (rules[field] !== undefined) 
    for (const rule of rules[field]) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return Object.keys(errors).length ? errors : null;
}

