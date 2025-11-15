import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    let username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    username = username.trim().replace(/^@/, '')

    const apiKey = request.headers.get('x-neynar-api-key') || process.env.NEYNAR_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please add NEYNAR_API_KEY in the Vars section.' },
        { status: 503 }
      )
    }

    const neynarUrl = `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}&api_key=${apiKey}`
    
    const neynarResponse = await fetch(neynarUrl, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (neynarResponse.status === 401 || neynarResponse.status === 403) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your NEYNAR_API_KEY in Vars.' },
        { status: 401 }
      )
    }

    if (!neynarResponse.ok) {
      return NextResponse.json(
        { error: 'User not found. Please check the username.' },
        { status: 404 }
      )
    }

    const neynarData = await neynarResponse.json()
    
    if (!neynarData.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = neynarData.user
    const profileData = {
      fid: user.fid,
      username: user.username,
      display_name: user.display_name || user.username,
      pfp_url: user.pfp?.url || '/diverse-avatars.png',
      bio: user.profile?.bio?.text || '',
      follower_count: user.follower_count || 0,
      following_count: user.following_count || 0,
      profile_created_at: user.created_at
        ? new Date(user.created_at).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Unknown',
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile. Please try again.' },
      { status: 500 }
    )
  }
}
