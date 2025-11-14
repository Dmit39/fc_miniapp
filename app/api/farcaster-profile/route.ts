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

    console.log('[v0] Fetching profile from Farcaster Hub for username:', username)

    const response = await fetch(
      `https://hub.lighthouse.farcaster.xyz/v1/userDataByFid?fid=${encodeURIComponent(username)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    console.log('[v0] Hub API response status:', response.status)

    // If first request fails, try getting by username via searchable route
    if (!response.ok) {
      const usernameResponse = await fetch(
        `https://hub.lighthouse.farcaster.xyz/v1/userDataByUsername?username=${encodeURIComponent(username)}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!usernameResponse.ok) {
        if (usernameResponse.status === 404) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }
        throw new Error(`Hub API error: ${usernameResponse.status}`)
      }

      const userData = await usernameResponse.json()
      console.log('[v0] User data received from Hub')

      const profileData = {
        fid: userData.fid || userData.id,
        username: userData.username,
        display_name: userData.display_name || userData.username,
        pfp_url: userData.pfp_url || userData.pfpUrl,
        bio: userData.bio,
        follower_count: userData.follower_count || 0,
        following_count: userData.following_count || 0,
        profile_created_at: userData.created_at || new Date().toISOString(),
        spam_label: null,
      }

      console.log('[v0] Profile data ready:', profileData)
      return NextResponse.json(profileData)
    }

    const data = await response.json()
    console.log('[v0] Data received successfully from Hub')

    const profileData = {
      fid: data.fid || data.id,
      username: data.username,
      display_name: data.display_name || data.username,
      pfp_url: data.pfp_url || data.pfpUrl,
      bio: data.bio,
      follower_count: data.follower_count || 0,
      following_count: data.following_count || 0,
      profile_created_at: data.created_at || new Date().toISOString(),
      spam_label: null,
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
