// Playlist Configuration with Multi-Source Support
const PLAYLISTS = {
  // Genre-based playlists (top 50) - Multiple sources for intelligent merging
  genres: [
    {
      name: 'Gospel',
      spotifyId: '0gn4xyjxOHOXuPQk9XA9Qo',
      topN: 50,
      trackingKey: 'gospel',
      sources: [
        { name: 'Gospel Essentials', url: 'https://music.apple.com/us/playlist/gospel-essentials/pl.eac9a3c14fee48dd9ba88c6efb2246f8' },
        { name: 'African Gospel', url: 'https://music.apple.com/us/playlist/african-gospel/pl.c5b1ec8662674e41a3e16044190e9dfa' },
        { name: 'Elevate', url: 'https://music.apple.com/us/playlist/elevate/pl.a5c4a84e09e54749b4213d2e0e1b4d0a' },
        { name: 'Gospel Flow', url: 'https://music.apple.com/us/playlist/gospel-flow/pl.7f9269da96b64de79b4178fb577ea49d' },
        { name: 'Sunday Soul', url: 'https://music.apple.com/us/playlist/sunday-soul/pl.505b08015f3f413c8f4fbbca8817c88e' },
        { name: 'New in Gospel', url: 'https://music.apple.com/us/playlist/new-in-gospel/pl.7da5023f6b624ee0aae0ee1b010cc5bc' },
        { name: 'Take Me to Church', url: 'https://music.apple.com/us/playlist/take-me-to-church/pl.da4addd0a5ff4805be0a5e232d0f242b' },
        { name: 'Gospel Workout', url: 'https://music.apple.com/us/playlist/gospel-workout/pl.d8ec95c7ffd94ea4bd20a9f31f04ea0d' },
        { name: 'Gospel Worship', url: 'https://music.apple.com/us/playlist/gospel-worship/pl.2bdba44288924df98a9118c263a1b5a8' },
        { name: 'Gospel Rewind', url: 'https://music.apple.com/us/playlist/gospel-rewind/pl.1fcff3457a6343daa9a0eb471bc89ee3' },
        { name: 'Afrobeats Gospel', url: 'https://music.apple.com/us/playlist/afrobeats-gospel/pl.4d18aab616b742a2aa659f2445b6c94a' }
      ]
    },
    {
      name: 'Afrobeats',
      spotifyId: '1A2vbMsTrtzXKJ1hGLEsO1',
      topN: 50,
      trackingKey: 'afrobeats',
      sources: [
        { name: 'Naija Hits', url: 'https://music.apple.com/us/playlist/naija-hits/pl.59d18bb92273474dbb69bb6be0dcda3f' },
        { name: 'Top 25 Lagos', url: 'https://music.apple.com/us/playlist/top-25-lagos/pl.cc32def4ec1349e8ba011c9c357d40ed' },
        { name: 'Afropop Hits', url: 'https://music.apple.com/us/playlist/afropop-hits/pl.92f2056626b748e6aaa5bb1ab3ba2141' },
        { name: 'Chill Afrobeats', url: 'https://music.apple.com/us/playlist/chill-afrobeats/pl.5a12841e4f7c4504b35534e8777fe6af' },
        { name: 'Sing Afrobeats', url: 'https://music.apple.com/us/playlist/sing-afrobeats/pl.89a5e71413ed4605ae70565f122cf847' },
        { name: 'Afrobeats Workout', url: 'https://music.apple.com/us/playlist/afrobeats-workout/pl.9a34a64942bb4df7a22f1e8d4327c755' },
        { name: 'Viral Afrobeats', url: 'https://music.apple.com/us/playlist/viral-afrobeats/pl.ac420fec54dc4184a5ebf10f22b41b35' },
        { name: 'Afrobeats Hits', url: 'https://music.apple.com/us/playlist/afrobeats-hits/pl.dc349df19c6f410d874c197db63ecfed' }
      ]
    },
    {
      name: 'Hip Hop',
      spotifyId: '3N4wWKQcMbw3rTz2bZoMTZ',
      topN: 50,
      trackingKey: 'hiphop',
      sources: [
        { name: 'Rap Life', url: 'https://music.apple.com/us/playlist/rap-life/pl.abe8ba42278f4ef490e3a9fc5ec8e8c5' },
        { name: '#OnRepeat', url: 'https://music.apple.com/us/playlist/onrepeat/pl.426a1044619f47d6b1f86b3f79ecf857' },
        { name: 'New in Hip-Hop', url: 'https://music.apple.com/gh/playlist/new-in-hip-hop/pl.1fa57a04cd794a8aa482a3492f26fbcd' },
        { name: 'African Hip-Hop', url: 'https://music.apple.com/gh/playlist/african-hip-hop/pl.31847c105ecf4d14b34793a3874eb9e9' },
        { name: "It's Lit!", url: 'https://music.apple.com/gh/playlist/its-lit/pl.2d4d74790f074233b82d07bfae5c219c' },
        { name: 'Hip-Hop Hits', url: 'https://music.apple.com/gh/playlist/hip-hop-hits/pl.87c7af5767764860a0e3368d0bef9a6f' },
        { name: 'The Plug', url: 'https://music.apple.com/gh/playlist/the-plug/pl.74fdbee9582349a4bdca600cbdffa2e9' },
        { name: 'BARS', url: 'https://music.apple.com/gh/playlist/bars/pl.3b3a73a8e9da4278830674b69430dd0c' }
      ]
    },
    {
      name: 'R&B',
      spotifyId: '5MxZKJl1ZpDiCwcaKcwAkE',
      topN: 50,
      trackingKey: 'randb',
      sources: [
        { name: 'Tearjerkers', url: 'https://music.apple.com/ng/playlist/tearjerkers/pl.eee5aa464ad440c0a6b355222d736207' },
        { name: 'Smooth and Easy', url: 'https://music.apple.com/ng/playlist/smooth-and-easy/pl.e48b617799b44f85bb6aab2ff753f3bf' },
        { name: 'Acoustic R&B', url: 'https://music.apple.com/ng/playlist/acoustic-r-b/pl.7378e49b2bc74ec186547e8185ee913f' },
        { name: 'R&B Workout', url: 'https://music.apple.com/ng/playlist/r-b-workout/pl.34e31ce1c28249c39478a4416bfd6a3a' },
        { name: 'Love Letters', url: 'https://music.apple.com/ng/playlist/love-letters/pl.1ee8ff3291e34650a47ad9cd031ddf39' },
        { name: 'Mood.', url: 'https://music.apple.com/ng/playlist/mood/pl.daa2a689923d4562bf5650a96809f929' },
        { name: 'Me and Bae', url: 'https://music.apple.com/ng/playlist/me-and-bae/pl.a13aca4f4f2c45538472de9014057cc0' },
        { name: 'New in R&B', url: 'https://music.apple.com/ng/playlist/new-in-r-b/pl.baa060f67ea94488a6e0c7e90c8afdb0' },
        { name: 'Afro-Soul Mix', url: 'https://music.apple.com/ng/playlist/afro-soul-mix/pl.8cc11ab005fe4136b54d93be258be9f6' },
        { name: 'R&B Hits', url: 'https://music.apple.com/ng/playlist/r-b-hits/pl.ffa2178ab08f4080bcf4075e14a1c3fe' },
        { name: 'R&B Now', url: 'https://music.apple.com/ng/playlist/r-b-now/pl.b7ae3e0a28e84c5c96c4284b6a6c70af' },
        { name: 'Northern Vibes', url: 'https://music.apple.com/ng/playlist/northern-vibes/pl.e82615b4ffce4d62a06f6ab9cf42ef0e' }
      ]
    },
    {
      name: 'Amapiano',
      spotifyId: '66LFmHaocfxJ6X7YkzQi4e',
      topN: 50,
      trackingKey: 'amapiano',
      sources: [
        { name: 'Lamba-Piano', url: 'https://music.apple.com/ng/playlist/lamba-piano/pl.9ee32430cf804bfb85eb8fcdaa17f40a' },
        { name: 'Tsa Ko Pitori', url: 'https://music.apple.com/ng/playlist/tsa-ko-pitori/pl.88f1f635a3ec46fb8af887ce5bef8893' },
        { name: 'Chill Yanos', url: 'https://music.apple.com/ng/playlist/chill-yanos/pl.a07214cf4c7b49148b53b42f5f41adce' },
        { name: 'Viral Amapiano', url: 'https://music.apple.com/ng/playlist/viral-amapiano/pl.40767611774f4d75a340e7627f3849b6' },
        { name: 'New In Amapiano', url: 'https://music.apple.com/ng/playlist/new-in-amapiano/pl.c05b10623a984376a1528fe240f710a8' },
        { name: "Private-School 'Piano", url: 'https://music.apple.com/ng/playlist/private-school-piano/pl.9e0d8bdae7284dbd9791f2f402e461de' },
        { name: 'Amapiano Lifestyle', url: 'https://music.apple.com/ng/playlist/amapiano-lifestyle/pl.c636d9c5362c49da8e3eb3834ebb0924' }
      ]
    },
    {
      name: 'EDM',
      spotifyId: '1iaq63jfFQK1f9shhzgZGD',
      topN: 50,
      trackingKey: 'edm',
      sources: [
        { name: 'Viral Dance', url: 'https://music.apple.com/ng/playlist/viral-dance/pl.3198298d69e84695b285fc219e2babb8' },
        { name: 'danceXL', url: 'https://music.apple.com/ng/playlist/dancexl/pl.6bf4415b83ce4f3789614ac4c3675740' },
        { name: 'Future Dance Hits', url: 'https://music.apple.com/ng/playlist/future-dance-hits/pl.811ac0f053a242bbab06df4bebf90562' },
        { name: 'New in Dance', url: 'https://music.apple.com/ng/playlist/new-in-dance/pl.9bd9accafe864654aac9f2dcceca5a69' },
        { name: 'All Day Dance Party', url: 'https://music.apple.com/ng/playlist/all-day-dance-party/pl.463c885fdf8b4745881901cc4b912357' },
        { name: 'Melodic House & Techno', url: 'https://music.apple.com/ng/playlist/melodic-house-techno/pl.9642e1be452d43fca846dead91e6e8aa' },
        { name: 'Breaking Dance', url: 'https://music.apple.com/ng/playlist/breaking-dance/pl.77a913605bba4a968c5cb2b93d87b2ca' },
        { name: 'Dance Pop Hits', url: 'https://music.apple.com/ng/playlist/dance-pop-hits/pl.02b98f9d97e54709be8272fc297636a4' },
        { name: 'House Grooves', url: 'https://music.apple.com/ng/playlist/house-grooves/pl.d73049603d7143ec86d84fc8b8af3827' },
        { name: 'Heavy Hitters', url: 'https://music.apple.com/ng/playlist/heavy-hitters/pl.3652c8971d244ec688479db7f7599f87' },
        { name: 'Chilltronics', url: 'https://music.apple.com/ng/playlist/chilltronics/pl.41871eaa3ab940cc8c0c60a3f70cde98' },
        { name: 'Drum \'n\' Bass', url: 'https://music.apple.com/ng/playlist/drum-n-bass/pl.7a75d4e444fb4b3583ec9d48a2b0eef6' },
        { name: 'Techno', url: 'https://music.apple.com/ng/playlist/techno/pl.7c5c00d3b2454c3a8bcbb5da3f395988' }
      ]
    }
  ],
  
  // Top 100 regional playlists - Single source each
  top100: [
    {
      name: 'Top 100 Nigeria',
      spotifyId: '2L5iGqAs5UkPN09B0JSeu2',
      topN: 100,
      trackingKey: 'top100_ng',
      sources: [
        { name: 'Top 100 Nigeria', url: 'https://music.apple.com/ng/playlist/top-100-nigeria/pl.2fc68f6d68004ae993dadfe99de83877' }
      ]
    },
    {
      name: 'Top 100 Ghana',
      spotifyId: '1UYp2xrN6HCu5EXJTukGgA',
      topN: 100,
      trackingKey: 'top100_gh',
      sources: [
        { name: 'Top 100 Ghana', url: 'https://music.apple.com/ng/playlist/top-100-ghana/pl.78f1974e882d4952b26ebfb8e017c933' }
      ]
    },
    {
      name: 'Top 100 Global',
      spotifyId: '66e1bpTzSY0d8bV6luivHL',
      topN: 100,
      trackingKey: 'top100_global',
      sources: [
        { name: 'Top 100 Global', url: 'https://music.apple.com/ng/playlist/top-100-global/pl.d25f5d1181894928af76c85c967f8f31' }
      ]
    },
    {
      name: 'Top 100 US',
      spotifyId: '6GXsCfniGhsYgMjlWJQrgt',
      topN: 100,
      trackingKey: 'top100_us',
      sources: [
        { name: 'Top 100 US', url: 'https://music.apple.com/ng/playlist/top-100-usa/pl.606afcbb70264d2eb2b51d8dbcfa6a12' }
      ]
    },
    {
      name: 'Top 100 UK',
      spotifyId: '52I0gDrHqY2WeF2pdxK7vg',
      topN: 100,
      trackingKey: 'top100_uk',
      sources: [
        { name: 'Top 100 UK', url: 'https://music.apple.com/ng/playlist/top-100-uk/pl.c2273b7e89b44121b3093f67228918e7' }
      ]
    }
  ]
};

module.exports = {
  PLAYLISTS
};
