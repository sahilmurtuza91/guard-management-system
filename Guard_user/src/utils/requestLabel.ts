export const formatRequestTitle = (serviceType?: string, date?: string | Date) => {
  const d = date ? new Date(date) : null;
  const dateText =
    d && !isNaN(d.getTime())
      ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';
  return [serviceType || 'Guard Request', dateText].filter(Boolean).join(' • ');
};
