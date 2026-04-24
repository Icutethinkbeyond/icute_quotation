// lib/line-messaging.ts

import { prisma } from "@/../lib/prisma";

interface LinePushOptions {
  lineUserId: string;
  messages: any[];
  accessToken?: string;
  storeId?: string;
  type?: string;
}

/**
 * Send LINE Push Message to a user and log to LineLog
 * @param lineUserId LINE User ID (recipient)
 * @param messages Array of messages to send
 * @param accessToken LINE Channel Access Token
 * @param storeId Store ID for logging (optional)
 * @param type Message type for logging (optional, default: "notification")
 */
export async function sendLinePushMessage(
  lineUserId: string, 
  messages: any[], 
  accessToken?: string, 
  storeId?: string, 
  type: string = "notification"
) {
  const logType = type || "notification";
  
  try {
    if (!accessToken) {
      throw new Error("LINE Channel Access Token is missing");
    }

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`LINE API Error: ${data.message || 'Unknown error'}`);
    }

    if (storeId) {
      await prisma.lineLog.create({
        data: {
          to: lineUserId,
          type: logType,
          success: true,
          storeId,
        },
      }).catch((logError) => console.error("Failed to create LineLog:", logError));
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send LINE message:', error);

    if (storeId) {
      await prisma.lineLog.create({
        data: {
          to: lineUserId,
          type: logType,
          success: false,
          error: error.message || "Unknown error",
          storeId,
        },
      }).catch((logError) => console.error("Failed to create LineLog:", logError));
    }

    return { success: false, error };
  }
}