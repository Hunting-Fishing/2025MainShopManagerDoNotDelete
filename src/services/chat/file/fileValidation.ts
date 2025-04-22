
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`
    };
  }

  const allowedTypes = [
    'image/',
    'video/',
    'audio/',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.some(type => file.type.startsWith(type))) {
    return {
      valid: false,
      error: 'Unsupported file type'
    };
  }

  return { valid: true };
};
