import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const neynarApiKey = process.env.NEYNAR_API_KEY
    if (!neynarApiKey) {
      return NextResponse.json(
        { error: 'Neynar API key not configured' },
        { status: 500 }
      )
    }

    console.log('[v0] Fetching profile from Neynar for username:', username)

    // Fetch user info from Neynar API
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'x-api-key': neynarApiKey,
        },
      }
    )

    console.log('[v0] Neynar API response status:', response.status)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      throw new Error(`Neynar API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[v0] Neynar data received successfully')

    // Extract relevant profile data
    const user = data.user
    const profileData = {
      fid: user.fid,
      username: user.username,
      display_name: user.display_name || user.username,
      pfp_url: user.pfp_url,
      bio: user.profile?.bio?.text,
      follower_count: user.follower_count,
      following_count: user.following_count,
      profile_created_at: user.created_at,
      spam_label: user.spam_label,
    }

    console.log('[v0] Profile data ready:', profileData)
    return NextResponse.json(profileData)
  } catch (error) {
    console.error('[v0] Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
