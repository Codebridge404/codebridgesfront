/**
 * CodeBridges Apple Gesture Physics & Momentum Engine
 * Algorithms translated from Apple WWDC "Designing Fluid Interfaces".
 */

/**
 * 1. Rubber-Banding Resistance
 * At an edge or boundary, resist progressively instead of stopping hard.
 * A hard stop reads as frozen; continuous resistance reads as physical and responsive.
 * 
 * @param overshoot - Distance dragged past boundary in pixels
 * @param dimension - The relevant container dimension (width or height) in pixels
 * @param constant - Apple's standard resistance constant (default: 0.55)
 */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant: number = 0.55
): number {
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}

/**
 * 2. Exponential-Decay Momentum Projection
 * Projects the resting landing point from the pointer's release velocity.
 * Used for fling-to-dismiss sheets, carousel snaps, and momentum scrolling.
 * 
 * @param initialVelocity - Velocity at release in px/s
 * @param decelerationRate - Deceleration coefficient (default: 0.998 for standard iOS feel; 0.99 for snappier)
 */
export function projectMomentum(
  initialVelocity: number,
  decelerationRate: number = 0.998
): number {
  return (
    ((initialVelocity / 1000) * decelerationRate) /
    (1 - decelerationRate)
  );
}

/**
 * 3. Relative Velocity Normalizer
 * Calculates normalized initial spring velocity based on remaining distance to target.
 * 
 * @param gestureVelocity - Finger/pointer release velocity in px/s
 * @param distanceRemaining - Delta between current position and target position
 */
export function calculateRelativeVelocity(
  gestureVelocity: number,
  distanceRemaining: number
): number {
  if (Math.abs(distanceRemaining) < 0.001) return 0;
  return gestureVelocity / distanceRemaining;
}

/**
 * 4. Nearest Snap Point Resolver
 * Selects the optimal snap target by taking current position + projected momentum.
 * 
 * @param currentPosition - Current on-screen coordinate
 * @param releaseVelocity - Velocity at release in px/s
 * @param snapPoints - Array of target snap points (e.g. [0, 300, 600])
 */
export function resolveSnapPoint(
  currentPosition: number,
  releaseVelocity: number,
  snapPoints: number[]
): number {
  const projectedEndpoint = currentPosition + projectMomentum(releaseVelocity);
  let closest = snapPoints[0];
  let minDiff = Math.abs(projectedEndpoint - closest);

  for (let i = 1; i < snapPoints.length; i++) {
    const diff = Math.abs(projectedEndpoint - snapPoints[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = snapPoints[i];
    }
  }

  return closest;
}

