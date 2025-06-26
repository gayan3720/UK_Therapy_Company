import moment from "moment";

export const disabledDateFromToday = (current) => {
  // Can not select days before today
  return current && current < moment().startOf("day");
};

export const shuffleArray = (array) => {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

export const getCountryCodes = (raw) => {
  return Object.entries(raw).map(([iso2, info]) => ({
    iso2: iso2.toLowerCase(),
    country: info.name,
    dial_code: `+${info.phone[0]}`,
  }));
};

export const getDialCode = (phoneString) => {
  return phoneString.split(" ")[0];
};

// Get the rest of the number (after the first space)
export const getPhoneNumber = (phoneString) => {
  const index = phoneString.indexOf(" ");
  return index !== -1 ? phoneString.substring(index + 1) : "";
};
