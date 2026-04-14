/**
 * Handle response to present to Frontend
 * @param {object} response
 * @returns { {success: boolean, statusCode: number, data: object} | {error: boolean, message: string, statusCode: number} }
 * */
function handleResponse(response) {
  if (!!response.error) {
    return {
      error: true,
      message: response.message,
      statusCode: response.statusCode || 400,
    };
  } else {
    return {
      success: true,
      statusCode: response?.statusCode || 200,
      data: response,
    };
  }
}
export { handleResponse };
