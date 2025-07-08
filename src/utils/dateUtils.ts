export const isDateInPeriod = (dateStr: string, period: string): boolean => {
  if (!dateStr || dateStr === "Desconhecido") return false;

  // Parse Brazilian date format (dd/mm/yyyy)
  const dateParts = dateStr.split("/");
  if (dateParts.length !== 3) return false;

  const contactDate = new Date(
    parseInt(dateParts[2]), // year
    parseInt(dateParts[1]) - 1, // month (0-indexed)
    parseInt(dateParts[0]), // day
  );

  if (isNaN(contactDate.getTime())) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case "today":
      const contactDay = new Date(
        contactDate.getFullYear(),
        contactDate.getMonth(),
        contactDate.getDate(),
      );
      return contactDay.getTime() === today.getTime();

    case "week":
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return contactDate >= weekAgo && contactDate <= now;

    case "month":
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      return contactDate >= monthAgo && contactDate <= now;

    case "older":
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return contactDate < thirtyDaysAgo;

    default:
      return true;
  }
};

// Formatação de data para a API do n8n
export const formatDateForN8NApi = (date: Date, isEndOfDay = false): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const time = isEndOfDay ? "23:59:59.999" : "00:00:00.000";
  const timezone = "-03:00"; // Horário de Brasília

  return `${year}-${month}-${day}T${time}${timezone}`;
};

// Validar se uma data está no formato ISO correto
export const isValidISODate = (dateStr: string): boolean => {
  try {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && dateStr.includes("T");
  } catch {
    return false;
  }
};
