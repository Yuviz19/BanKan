class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    data = {},
    error = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = data
    this.error = error;
    this.success = false

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
