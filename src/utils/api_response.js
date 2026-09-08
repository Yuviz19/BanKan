class ApiResponse {
  constructor(statusCode, data, success, message) {
    this.statusCode = statusCode;
    this.data = data;
    this.success = success;
    this.message = message;
  }
}

export { ApiResponse };
