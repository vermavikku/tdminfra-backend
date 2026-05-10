export enum MachineryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum EnquiryStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export const MACHINERY_STATUS_VALUES = Object.values(MachineryStatus);
export const ENQUIRY_STATUS_VALUES = Object.values(EnquiryStatus);

// Conversion helpers to map API-facing lowercase values to Prisma enum values (UPPERCASE keys)
export function toPrismaMachineryStatus(status?: MachineryStatus) {
  if (!status) return undefined;
  return status.toUpperCase() as unknown as import('@prisma/client').MachineryStatus;
}

export function toPrismaEnquiryStatus(status?: EnquiryStatus) {
  if (!status) return undefined;
  return status.toUpperCase() as unknown as import('@prisma/client').EnquiryStatus;
}
