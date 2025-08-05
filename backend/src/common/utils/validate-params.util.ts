import { BadRequestException } from '@nestjs/common';

/**
 * Validates that all required parameters are present and non-empty.
 * @param params An object where keys are parameter names and values are their values.
 * @throws BadRequestException if any parameter is missing or empty.
 */
export function validateRequiredParams(params: Record<string, any>) {
  const missing = Object.entries(params)
    .filter(([_, value]) => value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new BadRequestException(`Missing or invalid required parameter(s): ${missing.join(', ')}`);
  }
}
