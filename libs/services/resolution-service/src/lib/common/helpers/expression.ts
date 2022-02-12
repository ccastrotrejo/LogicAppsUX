import { equals, isNullOrEmpty } from '@microsoft-logic-apps/utils';
import { Expression, ExpressionFunction, ExpressionLiteral, ExpressionStringInterpolation } from '../models/expression';

export enum ExpressionType {
  NullLiteral = 'NullLiteral',
  BooleanLiteral = 'BooleanLiteral',
  NumberLiteral = 'NumberLiteral',
  StringLiteral = 'StringLiteral',
  Function = 'Function',
  StringInterpolation = 'StringInterpolation',
}

export enum ExpressionFunctionNames {
  PARAMETERS = 'PARAMETERS',
  APPSETTING = 'APPSETTING',
}

export function isTemplateExpression(value: string): boolean {
  if (isNullOrEmpty(value) || value.length < 2) {
    return false;
  }

  return value.charAt(0) === '@' || value.indexOf('@{') > 0;
}

export function isStringLiteral(expression: Expression): expression is ExpressionLiteral {
  return equals(expression.type, ExpressionType.StringLiteral);
}

export function isLiteralExpression(expression: Expression): expression is ExpressionLiteral {
  return isStringLiteral(expression) || isNumberLiteral(expression) || isBooleanLiteral(expression) || isNullLiteral(expression);
}

export function isFunction(expression: Expression): expression is ExpressionFunction {
  return equals(expression.type, ExpressionType.Function);
}

export function isStringInterpolation(expression: Expression): expression is ExpressionStringInterpolation {
  return equals(expression.type, ExpressionType.StringInterpolation);
}

export function isParameterOrAppSettingExpression(functionName: string): boolean {
  return isParameterExpression(functionName) || isAppSettingExpression(functionName);
}

function isParameterExpression(functionName: string) {
  return equals(functionName, ExpressionFunctionNames.PARAMETERS);
}

function isAppSettingExpression(functionName: string) {
  return equals(functionName, ExpressionFunctionNames.APPSETTING);
}

function isNullLiteral(expression: Expression): boolean {
  return equals(expression.type, ExpressionType.NullLiteral);
}

function isBooleanLiteral(expression: Expression): boolean {
  return equals(expression.type, ExpressionType.BooleanLiteral);
}

function isNumberLiteral(expression: Expression): boolean {
  return equals(expression.type, ExpressionType.NumberLiteral);
}
