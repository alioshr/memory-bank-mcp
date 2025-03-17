import { InvalidParamError } from "../presentation/errors/index.js";
import { Validator } from "../presentation/protocols/validator.js";
import { NAME_REGEX } from "./constants.js";

export class ParamNameValidator<T> implements Validator<T> {
  constructor(
    private readonly fieldName: keyof T & string,
    private readonly regex: RegExp = NAME_REGEX
  ) {}

  validate(input?: any): Error | null {
    if (!input || !input[this.fieldName]) {
      return null;
    }

    const paramName = input[this.fieldName];
    const isValid = this.regex.test(paramName);

    if (!isValid) {
      return new InvalidParamError(paramName);
    }

    return null;
  }
}
