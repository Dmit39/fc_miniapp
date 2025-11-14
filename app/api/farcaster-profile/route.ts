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

    console.log('[v0] Fetching profile for username:', username)

    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'Accept': 'application/json',
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
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[v0] User data received successfully')

    const user = data.user || data

    const profileData = {
      fid: user.fid,
      username: user.username,
      display_name: user.display_name || user.username,
      pfp_url: user.pfp_url,
      bio: user.profile?.bio || '',
      follower_count: user.follower_count || 0,
      following_count: user.following_count || 0,
      profile_created_at: new Date(user.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }

    console.log('[v0] Profile data ready:', profileData)
    return NextResponse.json(profileData)
  } catch (error) {
    console.error('[v0] Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile. Please try another username.' },
      { status: 500 }
    )
  }
}
