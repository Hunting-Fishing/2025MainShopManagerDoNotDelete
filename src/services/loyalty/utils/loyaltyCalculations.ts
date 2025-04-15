
export const calculateNewPoints = (currentPoints: number, pointsToAdd: number): number => {
  return currentPoints + pointsToAdd;
};

export const calculateNewLifetimePoints = (currentLifetimePoints: number, pointsToAdd: number): number => {
  return currentLifetimePoints + (pointsToAdd > 0 ? pointsToAdd : 0);
};

export const calculateAdjustment = (currentPoints: number, adjustment: number): number => {
  return Math.max(0, currentPoints + adjustment);
};
