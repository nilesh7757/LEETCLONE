import { NextResponse } from "next/server";
import { ApiError } from "./api-error";
import { logger } from "./logger";

type Handler<T extends unknown[]> = (req: Request, ...args: T) => Promise<NextResponse | Response>;

export function apiHandler<T extends unknown[]>(handler: Handler<T>): Handler<T> {
  return async (req: Request, ...args: T) => {
    try {
      return await handler(req, ...args);
    } catch (error: unknown) {
      logger.error("API Error:", error instanceof Error ? error.message : String(error));

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
