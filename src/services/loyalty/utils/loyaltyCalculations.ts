
/**
 * Calculate the new current points balance after adding/subtracting points
 */
export const calculateNewPoints = (currentPoints: number, pointsToAdd: number): number => {
  const newPoints = currentPoints + pointsToAdd;
  // Don't allow negative points
  return Math.max(0, newPoints);
};

/**
 * Calculate the new lifetime points after adding points
 * Only positive points contribute to lifetime points
 */
export const calculateNewLifetimePoints = (lifetimePoints: number, pointsToAdd: number): number => {
  if (pointsToAdd <= 0) {
    // Don't modify lifetime points for point deductions
    return lifetimePoints;
  }
  return lifetimePoints + pointsToAdd;
};

/**
 * Calculate points to award based on purchase amount
 */
export const calculatePointsFromPurchase = (
  purchaseAmount: number, 
  pointsPerDollar: number, 
  tierMultiplier = 1
): number => {
  return Math.floor(purchaseAmount * pointsPerDollar * tierMultiplier);
};
