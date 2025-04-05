import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function GET(request) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId");
    const messageType = request.nextUrl.searchParams.get("messageType");
    const role = request.nextUrl.searchParams.get("role");

    if (!accountId || !messageType) {
      return NextResponse.json(
        { error: "Please enter accountId and messageType" },
        { status: 400 }
      );
    }

    const res = await prisma.messageQueue.findMany({
      where: {
        name: messageType,

        messages: {
          some: {
            accountId: parseInt(accountId),
            role: role,
          },
        },
      },
      include: {
        messages: true,
      },
    });
    if (!res || res.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Flatten the messages array and sort by createdAt in descending order
    const messages = res
      .flatMap((queue) => queue.messages)
      .filter((message) => message.accountId === parseInt(accountId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    //messageCount fulfills the following user story:
    //As a user or hotel owner, I want to see the number of unread
    //  notifications as a badge and have it updated as I read them.
    return NextResponse.json(
      {
        accountId: parseInt(accountId),
        messageCount: messages.length,
        messages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Failed to get messages" },
      { status: 500 }
    );
  }
}

// message id should be sufficient to delete a message
// when we press the ui delete button, we will send the message id to the server
// and the server will delete the message with that id
export async function DELETE(request) {
  try {
    const { messageId } = await request.json();
    if (!messageId) {
      return NextResponse.json(
        { error: "messageType not found" },
        { status: 400 }
      );
    }

    const findMessage = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!findMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    const deletedMessage = await prisma.message.delete({
      where: {
        id: messageId,
      },
    });
    return NextResponse.json(deletedMessage, { status: 200 });
  } catch (error) {
    console.log(error.stack);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
