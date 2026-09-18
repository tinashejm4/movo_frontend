import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization")
  const upstreamUrl = `${API_BASE}/api/adminportal/delivery_metrics?${request.nextUrl.searchParams}`

  try {
    const response = await fetch(upstreamUrl, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: "no-store",
    })
    const body = await response.text()

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the delivery metrics service." },
      { status: 502 },
    )
  }
}