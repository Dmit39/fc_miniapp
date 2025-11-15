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

    const hubUrl = `https://hub.farcaster.xyz/server/userNameProofsByName/${username}`
    
    const hubResponse = await fetch(hubUrl)

    if (!hubResponse.ok) {
      return NextResponse.json(
        { error: 'User not found. Please check the username.' },
        { status: 404 }
      )
    }

    const proofsData = await hubResponse.json()
    
    if (!proofsData.proofs || proofsData.proofs.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const fid = proofsData.proofs[0].fid

    // Get user profile from Hub
    const profileUrl = `https://hub.farcaster.xyz/server/userDataByFid/${fid}`
    const profileResponse = await fetch(profileUrl)

    if (!profileResponse.ok) {
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

    return NextResponse.json({
      fid,
      username,
      display_name: displayName,
      pfp_url: pfpUrl,
      bio,
      follower_count: followerCount,
      following_count: followingCount,
      profile_created_at: createdAt,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile. Please try again.' },
      { status: 500 }
    )
  }
}
