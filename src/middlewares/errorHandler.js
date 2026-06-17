import ApiError from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
  //if it's our own error, use its value
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  //Unexpected errors (bugs, db crash ....)
  console.log("Unexpected Errors", err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    statusCode: 500,
  });
};

export default errorHandler;
