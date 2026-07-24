export const DOCUMENT_TYPES = [
  'passport',
  'visa',
  'boarding_pass',
  'hotel_booking',
  'receipt',
  'travel_insurance',
  'vaccination_certificate',
  'rental_agreement',
  'other',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
