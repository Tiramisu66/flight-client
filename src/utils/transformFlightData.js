/**
 * Transform airport object to include only necessary properties
 * @param {Object} airport - The airport object
 * @returns {Object} Transformed airport object with only needed properties
 */
/**
 * Transform array of flight data
 * @param {Array} flights - Array of flight objects
 * @returns {Array} Flight objects
 */
export const transformFlights = (flights) => {
  if (!Array.isArray(flights)) {
    console.error('Invalid flights data:', flights);
    return [];
  }
  return flights;
};
