import { ErrorRequestHandler, StatusCodes } from "@ooic/core";
const unhandled: ErrorRequestHandler = async (error, _request, response, _next) => {
  if (error.statusCode) return response.status(error.statusCode).send(error.message).json();
  response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error).json();
};
export default unhandled