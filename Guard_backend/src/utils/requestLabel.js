const requestLabel = (request) => {
  const type = request?.serviceType || 'guard';
  const date = request?.date ? new Date(request.date) : null;
  if (!date || isNaN(date.getTime())) return type;
  const dateText = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${type} on ${dateText}`;
};

module.exports = { requestLabel };
