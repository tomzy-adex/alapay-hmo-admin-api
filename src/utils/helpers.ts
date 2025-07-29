import { InternalServerErrorException } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
/**
 * Replaces dashes with spaces and capitalizes the first letter of each word.
 * @param {string} input - The string to transform (e.g., "hmo-admin").
 * @returns {string} The transformed string (e.g., "Hmo Admin").
 */
export const transformRoleType = (input: string): string => {
  return input
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generates a 6-digit OTP (One-Time Password) with digits only.
 *
 * @returns {Promise<string>} - The generated OTP.
 * @throws {InternalError} - If OTP generation fails.
 */
export const generateOtp = async (): Promise<string> => {
  try {
    return otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw new InternalServerErrorException('OTP generation failed.');
  }
};
