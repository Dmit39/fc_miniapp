import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    let username = searchParams.get('username')

    if (!username) {
      console.log('[v0] No username provided')
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    username = username.trim().replace(/^@/, '')
    console.log('[v0] Cleaned username:', username)

    const apiKey = process.env.NEYNAR_API_KEY
    
    console.log('[v0] API Key check:', apiKey ? 'Found' : 'Missing')

    if (!apiKey) {
      console.log('[v0] Warning: NEYNAR_API_KEY not configured')
      return NextResponse.json(
        { error: 'API key not configured. Please add NEYNAR_API_KEY in the Vars section.' },
        { status: 503 }
      )
    }

    console.log('[v0] Fetching from Neynar API with key...')
    const neynarUrl = `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}&api_key=${apiKey}`
    
    const neynarResponse = await fetch(neynarUrl, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log('[v0] Neynar response status:', neynarResponse.status)

    if (neynarResponse.status === 401 || neynarResponse.status === 403) {
      console.log('[v0] Invalid API key')
      return NextResponse.json(
        { error: 'Invalid API key. Please check your NEYNAR_API_KEY in Vars.' },
        { status: 401 }
      )
    }

    if (!neynarResponse.ok) {
      const errorText = await neynarResponse.text()
      console.log('[v0] Neynar error response:', errorText)
      return NextResponse.json(
        { error: 'User not found. Please check the username.' },
        { status: 404 }
      )
    }

    const neynarData = await neynarResponse.json()
    console.log('[v0] Neynar data received successfully')
    
    if (!neynarData.user) {
      console.log('[v0] No user data in response')
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
      profile_created_at: user.verified_addresses?.[0]?.created_at 
        ? new Date(user.verified_addresses[0].created_at).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Unknown',
    }

    console.log('[v0] Profile data prepared:', profileData)
    return NextResponse.json(profileData)
  } catch (error) {
    console.error('[v0] Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile. Please try again.' },
      { status: 500 }
    )
  }
}
