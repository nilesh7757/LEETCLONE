import { NextResponse } from "next/server";
import { ApiError } from "./api-error";
import { logger } from "./logger";
import { Prisma } from "@prisma/client";

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

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: "A record with this unique value already exists." },
            { status: 409 }
          );
        }
        if (error.code === 'P2025') {
          return NextResponse.json(
            { error: "The requested record was not found." },
            { status: 404 }
          );
        }
        // Handle other specific Prisma errors as needed
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
