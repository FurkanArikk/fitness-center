// Date formatting
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Date and time formatting
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Time formatting
export const formatTime = (timeString) => {
  if (!timeString) return "";

  // If the time is already in 'HH:MM:SS' format
  if (timeString.includes(":")) {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  }

  // If the time is a date string
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Currency formatting
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "$0.00";
  return `$${parseFloat(amount).toFixed(2)}`;
};

// Percentage formatting
export const formatPercentage = (value) => {
  if (value === undefined || value === null) return "0%";
  return `${Math.round(value)}%`;
};

// Name formatting
export const formatFullName = (firstName, lastName) => {
  if (!firstName && !lastName) return "";
  return `${firstName || ""} ${lastName || ""}`.trim();
};
