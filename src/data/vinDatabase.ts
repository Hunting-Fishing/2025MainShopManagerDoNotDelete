
import { VinDecodeResult } from '@/types/vehicle';

// This file is deprecated - VIN decoding now uses real APIs only
// No mock data should be used as fallback for production systems
export const mockVinDatabase: Record<string, VinDecodeResult> = {};

// Legacy export for backwards compatibility - always empty
export const vinDatabase = mockVinDatabase;
