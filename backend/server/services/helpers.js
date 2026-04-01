function handleResponse(response) {
  if (response.error) {
    return {
      error: true,
      message: response.message,
      statusCode: response.statusCode,
    };
  } else {
    return {
      success: true,
      statusCode: 200,
      data: response,
    };
  }
}
export { handleResponse };
