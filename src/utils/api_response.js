class ApiResponse {
  constructor(statusCode, data, success, message) {
    this.statusCode = statusCode;
    this.data = data;
    this.success = statusCode < 400;
    this.message = message;
  }
}

export { ApiResponse };
