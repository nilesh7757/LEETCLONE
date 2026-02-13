import { NextResponse } from "next/server";
import { ApiError } from "./api-error";
import { logger } from "./logger";

type Handler = (req: Request, ...args: any[]) => Promise<NextResponse | Response>;

export function apiHandler(handler: Handler): Handler {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      logger.error("API Error:", error);

      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }

      // Handle specific Prisma Errors if needed here
      // if (error.code === 'P2002') ...

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
