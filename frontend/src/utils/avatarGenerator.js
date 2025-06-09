/**
 * Professional Fitness-Themed Avatar Generator Utility
 * Generates consistent, professional sports/fitness-themed avatars for trainers using DiceBear Avatars API
 */

// Professional fitness-focused avatar styles from DiceBear - suitable for trainers
const PROFESSIONAL_SPORTS_AVATAR_STYLES = [
  "avataaars", // Popular, professional style with customizable features
  "personas", // Clean, modern professional avatars
  "adventurer", // Clean, modern style perfect for fitness professionals
  "big-smile", // Friendly, energetic but professional
  "lorelei", // Clean, minimalist professional style
];

// Sports/fitness themed background colors - more professional palette
const FITNESS_BACKGROUND_COLORS = [
  "4facfe", // Bright blue - swimming/water sports
  "00f2fe", // Cyan - fresh, energetic
  "43e97b", // Green - nature, outdoor fitness
  "fa709a", // Pink - energetic, vibrant
  "feb47b", // Orange - energy, enthusiasm
  "ff6b6b", // Red - strength, power
  "4ecdc4", // Teal - balance, wellness
  "45b7d1", // Blue - stability, trust
  "96ceb4", // Mint green - freshness, health
  "ffeaa7", // Yellow - happiness, energy
];

// Fitness specialization to color mapping
const SPECIALIZATION_COLORS = {
  yoga: "96ceb4", // Mint green - calm, balance
  pilates: "dda0dd", // Plum - flexibility, grace
  crossfit: "ff6b6b", // Red - intensity, strength
  cardio: "fa709a", // Pink - high energy
  strength: "4a4a4a", // Dark gray - power, stability
  hiit: "feb47b", // Orange - explosive energy
  spinning: "4facfe", // Blue - endurance
  zumba: "ffeaa7", // Yellow - fun, dance
  boxing: "ff4757", // Dark red - combat sports
  swimming: "00f2fe", // Cyan - water sports
  running: "43e97b", // Green - endurance, nature
  weightlifting: "2d3436", // Dark gray - heavy lifting
  aerobics: "fd79a8", // Light pink - rhythmic
  "martial arts": "636e72", // Gray - discipline
  gymnastics: "a29bfe", // Purple - grace, skill
};

/**
 * Generate a consistent hash from a string
 * @param {string} str - Input string to hash
 * @returns {number} - Hash value
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Get background color based on trainer's specialization
 * @param {string} specialization - Trainer's specialization
 * @param {string} fallbackSeed - Fallback seed for color selection
 * @returns {string} - Hex color code
 */
const getSpecializationColor = (specialization, fallbackSeed) => {
  if (!specialization) {
    const colorIndex =
      simpleHash(fallbackSeed) % FITNESS_BACKGROUND_COLORS.length;
    return FITNESS_BACKGROUND_COLORS[colorIndex];
  }

  const lowerSpec = specialization.toLowerCase();

  // Check for exact or partial matches
  for (const [key, color] of Object.entries(SPECIALIZATION_COLORS)) {
    if (lowerSpec.includes(key)) {
      return color;
    }
  }

  // Fallback to fitness colors
  const colorIndex =
    simpleHash(specialization + fallbackSeed) %
    FITNESS_BACKGROUND_COLORS.length;
  return FITNESS_BACKGROUND_COLORS[colorIndex];
};

/**
 * Generate professional sports/fitness-themed avatar URL for a trainer
 * @param {Object} trainer - Trainer object
 * @returns {string} - DiceBear avatar URL
 */
export const generateTrainerAvatar = (trainer) => {
  if (!trainer) return null;

  // Create a unique seed based on trainer data
  const trainerId = trainer.trainer_id || trainer.id || "";
  const trainerName = trainer.staff
    ? `${trainer.staff.first_name || ""}_${trainer.staff.last_name || ""}`
    : `trainer_${trainerId}`;

  // Create a consistent seed for this trainer
  const seed = `${trainerId}_${trainerName}`.toLowerCase().replace(/\s+/g, "_");

  // Select avatar style based on trainer ID for consistency
  const styleIndex =
    simpleHash(seed) % PROFESSIONAL_SPORTS_AVATAR_STYLES.length;
  const avatarStyle = PROFESSIONAL_SPORTS_AVATAR_STYLES[styleIndex];

  // Get background color based on specialization
  const backgroundColor = getSpecializationColor(
    trainer.specialization || "",
    seed
  );

  // Build the DiceBear avatar URL
  const baseUrl = "https://api.dicebear.com/7.x";
  const params = new URLSearchParams({
    seed: seed,
    backgroundColor: backgroundColor,
    size: 256, // High resolution for crisp display
  });

  // Add style-specific parameters for professional trainer appearance
  if (avatarStyle === "avataaars") {
    // Avataaars style - professional and customizable
    params.append(
      "accessories",
      "none,wayfarers,round,prescription01,prescription02"
    );
    params.append("accessoriesChance", "20"); // Minimal accessories for professional look
    params.append("clothe", "blazerShirt,blazerSweater,collarSweater,hoodie");
    params.append("eyes", "default,happy,wink");
    params.append("eyebrows", "default,defaultNatural,raisedExcited");
    params.append("facialHair", "none,light,medium");
    params.append("facialHairChance", "25");
    params.append("mouth", "default,smile,twinkle");
    params.append("skin", "tanned,yellow,pale,light,brown,darkBrown,black");
  } else if (avatarStyle === "personas") {
    // Personas style - very professional human-like avatars
    params.append("hair", "curly,long,short");
    params.append("beard", "true");
    params.append("beardChance", "20");
    params.append("glasses", "true");
    params.append("glassesChance", "15"); // Minimal glasses for professional look
  } else if (avatarStyle === "adventurer") {
    // Adventurer style - clean and modern for fitness professionals
    params.append("eyes", "variant01,variant02,variant03,variant04");
    params.append("mouth", "variant01,variant02,variant03,variant04");
    params.append("eyebrows", "variant01,variant02,variant03");
    params.append("glasses", "variant01,variant02");
    params.append("glassesChance", "15"); // Minimal sporty glasses
  } else if (avatarStyle === "big-smile") {
    // Always energetic and happy but professional
    params.append("eyes", "happy,smile,wink");
    params.append("mouth", "bigSmile,smile,laugh");
  } else if (avatarStyle === "lorelei") {
    // Clean, minimalist professional style
    params.append("eyes", "variant01,variant02,variant03");
    params.append("mouth", "variant01,variant02,variant03");
  }

  return `${baseUrl}/${avatarStyle}/svg?${params.toString()}`;
};

/**
 * Get fitness/sports icon based on trainer specialization
 * @param {Object} trainer - Trainer object
 * @returns {string} - SVG icon as string
 */
export const getFitnessIcon = (trainer) => {
  const specialization = (trainer?.specialization || "").toLowerCase();

  // Fitness icons mapping
  const fitnessIcons = {
    yoga: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2M21 9V7L15 3V5L9 1V3L3 7V9L9 13V11L15 15V13L21 9M12 7C14.8 7 17 9.2 17 12S14.8 17 12 17 7 14.8 7 12 9.2 7 12 7M12 9C10.3 9 9 10.3 9 12S10.3 15 12 15 15 13.7 15 12 13.7 9 12 9Z"/>
    </svg>`,
    strength: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.57,14.86L22,13.43L20.57,12L17,15.57L8.43,7L12,3.43L10.57,2L9.14,3.43L7.71,2L5.57,4.14L4.14,2.71L2.71,4.14L4.14,5.57L2,7.71L3.43,9.14L2,10.57L3.43,12L7,8.43L15.57,17L12,20.57L13.43,22L14.86,20.57L16.29,22L18.43,19.86L19.86,21.29L21.29,19.86L19.86,18.43L22,16.29L20.57,14.86Z"/>
    </svg>`,
    cardio: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
    </svg>`,
    running: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5,5.5C14.59,5.5 15.5,4.59 15.5,3.5S14.59,1.5 13.5,1.5 11.5,2.41 11.5,3.5 12.41,5.5 13.5,5.5M9.89,19.38L10.89,15L13,17V23H15V15.5L12.89,13.5L13.5,10.5C14.79,12 16.79,13 19,13V11C17.09,11 15.5,10 14.69,8.58L13.69,7C13.29,6.4 12.69,6 12,6C11.69,6 11.5,6.1 11.19,6.2L6,8.3V13H8V9.6L9.79,8.79L8.19,16L3,17.75V22H5V19.05L9.89,19.38Z"/>
    </svg>`,
    swimming: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2,18C4,16 6,16 8,18C10,20 12,20 14,18C16,16 18,16 20,18L22,16.5C20,14.5 18,14.5 16,16.5C14,18.5 12,18.5 10,16.5C8,14.5 6,14.5 4,16.5L2,18M2,22C4,20 6,20 8,22C10,24 12,24 14,22C16,20 18,20 20,22L22,20.5C20,18.5 18,18.5 16,20.5C14,22.5 12,22.5 10,20.5C8,18.5 6,18.5 4,20.5L2,22M18,8C19.1,8 20,7.1 20,6S19.1,4 18,4 16,4.9 16,6 16.9,8 18,8M16,10C13.79,10 12,11.79 12,14C12,16.21 13.79,18 16,18H18C20.21,18 22,16.21 22,14C22,11.79 20.21,10 18,10H16Z"/>
    </svg>`,
    crossfit: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5,3L20,7L16,11L13,9L11,7L13,5L15,7L18,4L15.5,1.5L20.5,3M5,12L1,16L3,18.5L7,14.5L9,12L7,10L5,12M12,14.5L9.5,17L14.5,22L17,19.5L12,14.5M14.5,1.5L12,4L14.5,6.5L17,4L14.5,1.5M9.5,17L7,19.5L9.5,22L12,19.5L9.5,17Z"/>
    </svg>`,
    boxing: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C20.11,11 21,11.9 21,13V20C21,21.11 20.11,22 19,22H5C3.89,22 3,21.11 3,20V13C3,11.9 3.89,11 5,11H7V5A5,5 0 0,1 12,0A5,5 0 0,1 17,5V11H19Z"/>
    </svg>`,
    pilates: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,2A3,3 0 0,1 15,5A3,3 0 0,1 12,8A3,3 0 0,1 9,5A3,3 0 0,1 12,2M21,9V7L15,3V5L9,1V3L3,7V9L9,13V11L15,15V13L21,9Z"/>
    </svg>`,
    zumba: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,3V5L9,1V3L3,7V9L9,13V11L15,15V13L21,9M7.5,13C8.3,13 9,13.7 9,14.5V19C9,19.6 8.6,20 8,20H7C6.4,20 6,19.6 6,19V14.5C6,13.7 6.7,13 7.5,13M16.5,13C17.3,13 18,13.7 18,14.5V19C18,19.6 17.6,20 17,20H16C15.4,20 15,19.6 15,19V14.5C15,13.7 15.7,13 16.5,13Z"/>
    </svg>`,
  };

  // Return specific icon or default dumbbell icon
  return (
    fitnessIcons[specialization] ||
    `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.57,14.86L22,13.43L20.57,12L17,15.57L8.43,7L12,3.43L10.57,2L9.14,3.43L7.71,2L5.57,4.14L4.14,2.71L2.71,4.14L4.14,5.57L2,7.71L3.43,9.14L2,10.57L3.43,12L7,8.43L15.57,17L12,20.57L13.43,22L14.86,20.57L16.29,22L18.43,19.86L19.86,21.29L21.29,19.86L19.86,18.43L22,16.29L20.57,14.86Z"/>
  </svg>`
  );
};

/**
 * Get initials from trainer name for fallback display
 * @param {Object} trainer - Trainer object
 * @returns {string} - Initials (e.g., "JD")
 */
export const getTrainerInitials = (trainer) => {
  if (!trainer) return "TR";

  if (trainer.staff && trainer.staff.first_name && trainer.staff.last_name) {
    const firstName = trainer.staff.first_name.trim();
    const lastName = trainer.staff.last_name.trim();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  const trainerId = trainer.trainer_id || trainer.id || "";
  return `T${trainerId.toString().slice(-1)}`;
};

/**
 * Fitness-themed avatar component with sports styling
 * @param {Object} props - Component props
 * @param {Object} props.trainer - Trainer object
 * @param {string} props.size - Size class (e.g., 'w-16 h-16')
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showIcon - Whether to show fitness icon overlay
 * @returns {JSX.Element} - Avatar component
 */
export const TrainerAvatar = ({
  trainer,
  size = "w-16 h-16",
  className = "",
  showIcon = false,
}) => {
  const avatarUrl = generateTrainerAvatar(trainer);
  const initials = getTrainerInitials(trainer);
  const fitnessIcon = getFitnessIcon(trainer);
  const trainerName = trainer?.staff
    ? `${trainer.staff.first_name || ""} ${
        trainer.staff.last_name || ""
      }`.trim()
    : `Trainer #${trainer?.trainer_id || trainer?.id || "Unknown"}`;

  // Get specialization color for fallback background
  const backgroundColor = getSpecializationColor(
    trainer?.specialization || "",
    `${trainer?.trainer_id || trainer?.id || "default"}`
  );

  return (
    <div
      className={`${size} rounded-full overflow-hidden relative ${className}`}
    >
      <img
        src={avatarUrl}
        alt={`${trainerName} profile picture`}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to fitness-themed initials if image fails to load
          e.target.style.display = "none";
          const fallback = e.target.nextElementSibling;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        className="w-full h-full flex items-center justify-center text-white font-bold text-lg relative"
        style={{
          display: "none",
          background: `linear-gradient(135deg, #${backgroundColor}, #${backgroundColor}dd)`,
        }}
      >
        <span className="z-10">{initials}</span>
        {/* Fitness pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: fitnessIcon }}
          />
        </div>
      </div>

      {/* Optional fitness icon overlay */}
      {showIcon && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div
            className="w-4 h-4 text-gray-600"
            dangerouslySetInnerHTML={{ __html: fitnessIcon }}
          />
        </div>
      )}
    </div>
  );
};

export default {
  generateTrainerAvatar,
  getTrainerInitials,
  getFitnessIcon,
  TrainerAvatar,
};
