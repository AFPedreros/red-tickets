export function formatDate(isoDate: string) {
  const date = new Date(isoDate);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[date.getUTCMonth()];

  // Obtener el día del mes
  const day = date.getUTCDate();

  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${monthName} ${day} at ${hours}:${minutes}`;
}
