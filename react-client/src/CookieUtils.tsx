import Cookies from "js-cookie";

// Function to set or update the cookie
export function setOrUpdateCookie(): string {
  let cookieId = getCookie();
  if (!cookieId) {
    cookieId = generateUUID(); // Assuming you have a UUID generator function
    Cookies.set("userCookieId", cookieId, { expires: 365 }); // Expires in 365 days
  }
  return cookieId;
}

// Function to get the cookie
export function getCookie(): string | undefined {
  return Cookies.get("userCookieId");
}

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
