// src/validators/unique-array.constraint.ts
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'UniqueArray', async: false })
export class UniqueArrayConstraint implements ValidatorConstraintInterface {
  validate(values: any[]): boolean {
    return values.length === new Set(values).size;
  }

  defaultMessage(): string {
    return 'Mobile number contains duplicate values';
  }
}

export function UniqueArray(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueArrayConstraint,
    });
  };
}