import { NextResponse } from "next/server"
import { RtcRole, RtcTokenBuilder } from "agora-token"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const channelName: string = body?.channelName
  const uid: number = Number(body?.uid ?? 0)

  if (!channelName) {
    return NextResponse.json({ error: "channelName required" }, { status: 400 })
  }

  const appId = process.env.AGORA_APP_ID!
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!
  if (!appId || !appCertificate) {
    return NextResponse.json({ error: "Agora credentials not configured" }, { status: 500 })
  }

  const expirationTimeInSeconds = 60 * 60 // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs,
    privilegeExpiredTs,
  )

  return NextResponse.json({ token, appId, channelName, uid, expiresAt: privilegeExpiredTs })
}
