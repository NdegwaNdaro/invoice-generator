export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
}

export function handleError(error, _req, res, _next) {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 ? "An unexpected error occurred." : error.message
  });
}
