/**
 * Avatar utility functions for handling profile images
 */

/**
 * Get the appropriate profile image source for a user
 * @param {string} profileImage - The user's profile image URL
 * @param {string|number} userId - The user's ID for fallback avatar
 * @returns {string} The profile image source URL
 */
export const getProfileImageSrc = (profileImage, userId) => {
  if (profileImage) {
    return profileImage;
  }

  // Generate a fallback avatar using a placeholder service
  return `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`;
};

/**
 * Generate initials from a name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return "??";

  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";

  return first + last;
};

/**
 * Check if an image URL is valid
 * @param {string} url - The image URL to validate
 * @returns {Promise<boolean>} Promise that resolves to true if image is valid
 */
export const isValidImageUrl = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};
