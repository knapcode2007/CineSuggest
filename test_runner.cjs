const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=========================================");
  console.log("       CineSuggest Automated API Test   ");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;
  let authToken = null;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health Check
  await test("GET /api/health", async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.status !== 'ok') throw new Error(`Expected status 'ok', got ${res.body.status}`);
    console.log(`  Health response: app=${res.body.app}, gemini=${res.body.geminiEnabled}, tmdb=${res.body.tmdbEnabled}`);
  });

  // 2. Auth: Register
  const testUser = {
    name: "Test User",
    email: `test_${Date.now()}@example.com`,
    password: "Password123!",
    favoriteGenres: ["Sci-Fi", "Thriller"]
  };

  await test("POST /api/auth/register", async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, testUser);

    if (res.status !== 201 && res.status !== 200) throw new Error(`Expected 200/201, got ${res.status}: ${JSON.stringify(res.body)}`);
    const data = res.body.data || res.body;
    if (!data.token) throw new Error("Missing JWT token in registration response");
    authToken = data.token;
    console.log(`  Registered user ID: ${data.user ? data.user._id : 'N/A'}`);
  });

  // 3. Auth: Login
  await test("POST /api/auth/login", async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testUser.email,
      password: testUser.password
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
    const data = res.body.data || res.body;
    if (!data.token) throw new Error("Missing JWT token in login response");
    authToken = data.token;
  });

  // 4. Auth: Get Current User Me
  await test("GET /api/auth/me (Authenticated)", async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const user = res.body.data ? res.body.data.user : res.body.user;
    if (user.email !== testUser.email) throw new Error(`Email mismatch: ${user.email}`);
  });

  // 5. Movies: Trending
  let sampleMovieId = null;
  await test("GET /api/movies/trending", async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/movies/trending',
      method: 'GET'
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const movies = res.body.data || [];
    if (!Array.isArray(movies) || movies.length === 0) throw new Error("No trending movies returned");
    sampleMovieId = movies[0].id;
    console.log(`  Trending returned ${movies.length} movies. First: "${movies[0].title}" (ID: ${sampleMovieId})`);
  });

  // 6. Movies: Popular, Top Rated, Upcoming
  await test("GET /api/movies/popular", async () => {
    const res = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/movies/popular', method: 'GET' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const movies = res.body.data || [];
    console.log(`  Popular returned ${movies.length} movies.`);
  });

  await test("GET /api/movies/top-rated", async () => {
    const res = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/movies/top-rated', method: 'GET' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const movies = res.body.data || [];
    console.log(`  Top Rated returned ${movies.length} movies.`);
  });

  await test("GET /api/movies/upcoming", async () => {
    const res = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/movies/upcoming', method: 'GET' });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const movies = res.body.data || [];
    console.log(`  Upcoming returned ${movies.length} movies.`);
  });

  // 7. Movies: Search
  await test("GET /api/movies/search?query=Inception", async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/movies/search?query=Inception',
      method: 'GET'
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const results = res.body.data || [];
    console.log(`  Search for "Inception" returned ${results.length} results.`);
  });

  // 8. Movies: Details & Credits
  await test(`GET /api/movies/${sampleMovieId}`, async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/movies/${sampleMovieId}`,
      method: 'GET'
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const movie = res.body.data || res.body;
    if (!movie.title) throw new Error("Movie details missing title");
    console.log(`  Movie details fetched for "${movie.title}"`);
  });

  await test(`GET /api/movies/${sampleMovieId}/credits`, async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/movies/${sampleMovieId}/credits`,
      method: 'GET'
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const credits = res.body.data || res.body;
    console.log(`  Credits fetched: ${credits.cast ? credits.cast.length : 0} cast members.`);
  });

  // 9. Watchlist: Add & Get & Remove
  await test("Watchlist Operations (POST, GET, DELETE)", async () => {
    // Add
    let addRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/watchlist',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, { movieId: sampleMovieId, status: 'plan-to-watch' });
    if (addRes.status !== 200 && addRes.status !== 201) throw new Error(`Add failed: ${addRes.status} ${JSON.stringify(addRes.body)}`);

    // Get
    let getRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/watchlist',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (getRes.status !== 200) throw new Error(`Get failed: ${getRes.status}`);
    const list = getRes.body.data || [];
    console.log(`  Watchlist count after add: ${list.length}`);

    // Remove
    let delRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/watchlist/${sampleMovieId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (delRes.status !== 200) throw new Error(`Delete failed: ${delRes.status}`);
    console.log(`  Successfully removed movie ${sampleMovieId} from watchlist.`);
  });

  // 10. Ratings: Add & Get & Delete
  await test("Rating Operations (POST, GET, DELETE)", async () => {
    // Add rating
    let addRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/ratings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, { movieId: sampleMovieId, rating: 5, review: "Masterpiece!" });
    if (addRes.status !== 200 && addRes.status !== 201) throw new Error(`Rating failed: ${addRes.status} ${JSON.stringify(addRes.body)}`);

    // Get user ratings
    let getRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/ratings/user',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (getRes.status !== 200) throw new Error(`Get user ratings failed: ${getRes.status}`);
    const ratings = getRes.body.data || [];
    console.log(`  User ratings count: ${ratings.length}`);

    // Delete rating
    let delRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/ratings/${sampleMovieId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (delRes.status !== 200) throw new Error(`Delete rating failed: ${delRes.status}`);
    console.log(`  Successfully deleted rating for movie ${sampleMovieId}.`);
  });

  // 11. Personalized Recommendations
  await test("GET /api/recommendations", async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/recommendations',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const recs = res.body.data || [];
    console.log(`  Recommendations engine returned ${recs.length} personalized movies.`);
  });

  // 12. AI Natural Language Query
  await test("POST /api/ai/movie-query (Natural Language Query)", async () => {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai/movie-query',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { query: "mind-bending sci-fi movies about space travel and time" });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = res.body.data || res.body;
    console.log(`  AI query results count: ${(data.movies || []).length}`);
    if (data.structured) {
      console.log(`  Structured AI analysis: genres=${(data.structured.genres || []).join(",")}, summary="${data.structured.summary}"`);
    }
  });

  console.log("\n=========================================");
  console.log(` Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
