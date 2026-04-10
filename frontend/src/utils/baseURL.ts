// Frontend - get the correct backend API base URL
export const getBaseURL = () => {
  // Use the production backend domain
  return "http://localhost:5000";
};

// Alternative: Use environment variable for flexibility
// export const getBaseURL = () => {
//   if (process.env.NODE_ENV === "production") {
//     return process.env.VITE_API_URL || "https://theekaa.vercel.app";
//   }
//   return process.env.VITE_API_URL || "http://localhost:5000";
// };
