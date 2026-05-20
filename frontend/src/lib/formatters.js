export const formatCurrency = (
  value,
  currency = "USD",
  maximumFractionDigits = 0
) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(amount);
};

export const formatNumber = (
  value,
  maximumFractionDigits = 2
) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(amount);
};

export const formatCompactCurrency = (
  value,
  currency = "USD"
) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

export const formatDateTime = (value) => {
  if (!value) {
    return "Waiting for sync";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
};
