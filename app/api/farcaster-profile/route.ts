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

    // Try Neynar API first (public endpoint)
    console.log('[v0] Trying Neynar public API...')
    try {
      const neynarResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}`
      )

      if (neynarResponse.ok) {
        const neynarData = await neynarResponse.json()
        console.log('[v0] Neynar API success')
        
        const user = neynarData.user
        return NextResponse.json({
          fid: user.fid,
          username: user.username,
          display_name: user.display_name || user.username,
          pfp_url: user.pfp?.url || '/diverse-avatars.png',
          bio: user.profile?.bio?.text || '',
          follower_count: user.follower_count || 0,
          following_count: user.following_count || 0,
          profile_created_at: new Date().toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        })
      }
    } catch (e) {
      console.log('[v0] Neynar API error:', e)
    }

    console.log('[v0] Trying Fname Registry...')
    const fnameResponse = await fetch(
      `https://fnames.farcaster.xyz/transfers/current?name=${encodeURIComponent(username)}`
    )

    console.log('[v0] Fname response status:', fnameResponse.status)

    if (!fnameResponse.ok) {
      console.log('[v0] Fname lookup failed, status:', fnameResponse.status)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const fnameData = await fnameResponse.json()
    console.log('[v0] Fname data received:', JSON.stringify(fnameData))
    
    const transfer = fnameData.transfers?.[0]
    const fid = transfer?.to

    if (!fid) {
      console.log('[v0] No FID found in response')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Found FID:', fid)

    // Get profile from Hub
    const hubResponse = await fetch(
      `https://hub.farcaster.xyz/v1/userDataByFid?fid=${fid}`
    )

    if (!hubResponse.ok) {
      throw new Error(`Hub API error: ${hubResponse.status}`)
    }

    const hubData = await hubResponse.json()
    console.log('[v0] Hub API response received')

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
      console.log('[v0] Searchcaster failed:', e)
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
