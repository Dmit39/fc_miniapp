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

    const fnameResponse = await fetch(
      `https://fnames.farcaster.xyz/transfers/current?name=${encodeURIComponent(username)}`
    )

    if (!fnameResponse.ok) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const fnameData = await fnameResponse.json()
    const fid = fnameData.to

    if (!fid) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Found FID:', fid)

    const hubResponse = await fetch(
      `https://hub.farcaster.xyz/v1/userDataByFid?fid=${fid}`
    )

    if (!hubResponse.ok) {
      throw new Error(`Hub API error: ${hubResponse.status}`)
    }

    const hubData = await hubResponse.json()
    console.log('[v0] Hub API response received')

    // Extract profile data from Hub API response
    let pfpUrl = ''
    let displayName = username
    let bio = ''

    if (hubData.messages) {
      hubData.messages.forEach((msg: any) => {
        const data = msg.data?.userDataBody
        if (data?.type === 'PFP') {
          pfpUrl = data.value
        } else if (data?.type === 'DISPLAY') {
          displayName = data.value
        } else if (data?.type === 'BIO') {
          bio = data.value
        }
      })
    }

    // Using backup endpoint for counts
    let followerCount = 0
    let followingCount = 0

    try {
      const searchcasterResponse = await fetch(
        `https://api.searchcaster.xyz/search/users?username=${encodeURIComponent(username)}&limit=1`
      )
      if (searchcasterResponse.ok) {
        const searchcasterData = await searchcasterResponse.json()
        if (searchcasterData.result?.users?.[0]) {
          const user = searchcasterData.result.users[0]
          followerCount = user.follower_count || 0
          followingCount = user.following_count || 0
        }
      }
    } catch (e) {
      console.log('[v0] Searchcaster backup failed, using defaults')
    }

    const profileData = {
      fid: fid,
      username: username,
      display_name: displayName,
      pfp_url: pfpUrl || '/diverse-avatars.png',
      bio: bio,
      follower_count: followerCount,
      following_count: followingCount,
      profile_created_at: new Date().toLocaleDateString('ru-RU', {
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
