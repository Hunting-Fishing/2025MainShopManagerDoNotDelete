
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatCategoryName = (category: string): string => {
  if (category === 'workOrder') return 'Work Order';
  return capitalize(category);
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
};
