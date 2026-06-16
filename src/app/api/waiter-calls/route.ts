import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const tableNumber = String(body.tableNumber ?? "").trim();
    const message = body.message ? String(body.message).trim() : null;

    if (!tableNumber) {
      return NextResponse.json(
        { error: "Table number is required." },
        { status: 400 }
      );
    }

    const existingOpenCall = await db.waiterCall.findFirst({
      where: {
        tableNumber,
        status: "OPEN"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (existingOpenCall) {
      return NextResponse.json(
        {
          waiterCallId: existingOpenCall.id,
          message: "Waiter call is already active."
        },
        { status: 200 }
      );
    }

    const waiterCall = await db.waiterCall.create({
      data: {
        tableNumber,
        message
      }
    });

    return NextResponse.json(
      {
        waiterCallId: waiterCall.id,
        message: "Waiter has been called."
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to call waiter right now." },
      { status: 500 }
    );
  }
}