import { NextResponse } from "next/server";

export function successResponse(data: any, message: string = "Success", status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string = "Error", status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

export function forbiddenResponse(message: string = "Forbidden") {
  return errorResponse(message, 403);
}

export function notFoundResponse(message: string = "Not Found") {
  return errorResponse(message, 404);
}

export function serverErrorResponse(message: string = "Internal Server Error") {
  return errorResponse(message, 500);
}
