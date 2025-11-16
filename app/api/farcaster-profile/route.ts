import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    let username = searchParams.get('username')

    console.log('[v0] API: Received request for username:', username)

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    username = username.trim().replace(/^@/, '')
    console.log('[v0] API: Cleaned username:', username)

    // Try multiple Hub endpoints with better error handling
    const hubUrl = `https://hub.farcaster.xyz/server/userNameProofsByName/${username}`
    console.log('[v0] API: Fetching from Hub URL:', hubUrl)
    
    const hubResponse = await fetch(hubUrl, {
      headers: {
        'Accept': 'application/json',
      }
    })

    console.log('[v0] API: Hub response status:', hubResponse.status)

    if (!hubResponse.ok) {
      console.log('[v0] API: Hub request failed with status:', hubResponse.status)
      // Try alternative endpoint
      const searchUrl = `https://searchcaster.xyz/api/profiles?username=${username}`
      console.log('[v0] API: Trying alternative endpoint:', searchUrl)
      
      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) {
        return NextResponse.json(
          { error: 'User not found. Please check the username.' },
          { status: 404 }
        )
      }
      
      const searchData = await searchResponse.json()
      console.log('[v0] API: Search results:', searchData)
      
      if (!searchData.result || searchData.result.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      
      const profile = searchData.result[0]
      return NextResponse.json({
        fid: profile.fid,
        username: profile.username,
        display_name: profile.displayName || profile.username,
        pfp_url: profile.pfp?.url || '/diverse-avatars.png',
        bio: profile.bio || '',
        follower_count: profile.followerCount || 0,
        following_count: profile.followingCount || 0,
        profile_created_at: new Date(profile.joinedAt).toLocaleDateString('ru-RU'),
      })
    }

    const proofsData = await hubResponse.json()
    console.log('[v0] API: Proofs data:', proofsData)
    
    if (!proofsData.proofs || proofsData.proofs.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const fid = proofsData.proofs[0].fid
    console.log('[v0] API: Found FID:', fid)

    // Get user profile from Hub
    const profileUrl = `https://hub.farcaster.xyz/server/userDataByFid/${fid}`
    const profileResponse = await fetch(profileUrl)

    if (!profileResponse.ok) {
      console.log('[v0] API: Could not fetch profile data')
      return NextResponse.json(
        { error: 'Could not fetch profile data' },
        { status: 500 }
      )
    }

    const profileData = await profileResponse.json()
    
    // Get follower count
    const followersUrl = `https://hub.farcaster.xyz/server/links/followers?targetFid=${fid}`
    const followersResponse = await fetch(followersUrl)
    const followersData = await followersResponse.json()
    const followerCount = followersData.messages?.length || 0

    // Get following count
    const followingUrl = `https://hub.farcaster.xyz/server/links/following?fid=${fid}`
    const followingResponse = await fetch(followingUrl)
    const followingData = await followingResponse.json()
    const followingCount = followingData.messages?.length || 0

    // Extract profile information
    let displayName = username
    let pfpUrl = '/diverse-avatars.png'
    let bio = ''
    let createdAt = new Date().toLocaleDateString('ru-RU')

    if (profileData.messages) {
      profileData.messages.forEach((msg: any) => {
        if (msg.userDataBody?.type === 1) {
          displayName = msg.userDataBody.value || displayName
        } else if (msg.userDataBody?.type === 2) {
          pfpUrl = msg.userDataBody.value || pfpUrl
        } else if (msg.userDataBody?.type === 3) {
          bio = msg.userDataBody.value || bio
        }
      })
    }

    const result = {
      fid,
      username,
      display_name: displayName,
      pfp_url: pfpUrl,
      bio,
      follower_count: followerCount,
      following_count: followingCount,
      profile_created_at: createdAt,
    }
    
    console.log('[v0] API: Returning result:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile. Please try again.' },
      { status: 500 }
    )
  }
}
