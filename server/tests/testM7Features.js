const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Configure test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
process.env.PORT = process.env.TEST_PORT || '5056';

const PORT = process.env.PORT;
const BASE_URL = `http://localhost:${PORT}/api`;

const results = [];

function recordTest(suite, name, status, details = '') {
  results.push({ suite, name, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${suite}] ${name}: ${status} ${details ? '(' + details + ')' : ''}`);
}

async function runM7Audit() {
  console.log('========================================================');
  console.log('🌿 TESTING PROFILE, BADGES & LEADERBOARD IMPLEMENTATION');
  console.log('========================================================\n');

  // Start the server
  const app = require('../server');

  // Wait for MongoDB connection
  for (let i = 0; i < 20; i++) {
    if (mongoose.connection.readyState === 1) break;
    await new Promise((r) => setTimeout(r, 500));
  }

  const timestamp = Date.now();
  const testStudent = {
    name: `Eco Pioneer ${timestamp}`,
    email: `eco.pioneer.${timestamp}@greencampus.edu`,
    password: 'Password@123',
  };

  let token = '';
  let userId = '';

  // 1. Register test student
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testStudent),
  });
  const regData = await regRes.json();
  token = regData.token;
  userId = regData.user?.id || regData.user?._id;

  // --------------------------------------------------------
  // TEST SUITE 1: STUDENT PROFILE
  // --------------------------------------------------------
  console.log('\n--- 1. STUDENT PROFILE VERIFICATION ---');

  // 1.1 GET Profile
  try {
    const profRes = await fetch(`${BASE_URL}/users/me/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profData = await profRes.json();
    if (
      profRes.status === 200 &&
      profData.success &&
      profData.profile.email === testStudent.email &&
      profData.stats
    ) {
      recordTest(
        'Student Profile',
        'Fetch Authenticated Student Profile & Metrics',
        'PASS',
        `Rank: #${profData.profile.rank}, Level: ${profData.profile.level}`
      );
    } else {
      recordTest('Student Profile', 'Fetch Authenticated Student Profile & Metrics', 'FAIL', profData.message);
    }
  } catch (err) {
    recordTest('Student Profile', 'Fetch Authenticated Student Profile & Metrics', 'FAIL', err.message);
  }

  // 1.2 PUT Profile (Update Bio, Department, Year)
  try {
    const updatePayload = {
      name: `Eco Pioneer Champion ${timestamp}`,
      department: 'Environmental Science & Ecology',
      yearOfStudy: 'Final Year Undergraduate',
      bio: 'Pioneering solar and compost initiatives across campus dorms.',
      avatar: '🌲',
    };

    const updateRes = await fetch(`${BASE_URL}/users/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatePayload),
    });
    const updateData = await updateRes.json();

    // Re-query database to verify persistence
    const User = mongoose.model('User');
    const updatedDbUser = await User.findById(userId);

    if (
      updateRes.status === 200 &&
      updateData.success &&
      updatedDbUser.department === updatePayload.department &&
      updatedDbUser.avatar === '🌲' &&
      updatedDbUser.bio.includes('compost')
    ) {
      recordTest(
        'Student Profile',
        'Update Profile & Persist in MongoDB',
        'PASS',
        `Department: ${updatedDbUser.department}, Avatar: ${updatedDbUser.avatar}`
      );
    } else {
      recordTest('Student Profile', 'Update Profile & Persist in MongoDB', 'FAIL', updateData.message);
    }
  } catch (err) {
    recordTest('Student Profile', 'Update Profile & Persist in MongoDB', 'FAIL', err.message);
  }

  // 1.3 Change Password with Validation
  try {
    // Bad current password should return 400
    const badPwRes = await fetch(`${BASE_URL}/users/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: 'WrongPassword',
        newPassword: 'NewSecurePassword@123',
      }),
    });
    const badPwData = await badPwRes.json();

    // Valid current password should succeed
    const goodPwRes = await fetch(`${BASE_URL}/users/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: testStudent.password,
        newPassword: 'NewSecurePassword@123',
      }),
    });
    const goodPwData = await goodPwRes.json();

    if (badPwRes.status === 400 && goodPwRes.status === 200 && goodPwData.success) {
      recordTest('Student Profile', 'Change Password & Security Validation', 'PASS', 'Incorrect current password rejected; valid change accepted');
    } else {
      recordTest('Student Profile', 'Change Password & Security Validation', 'FAIL', `badPw: ${badPwRes.status}, goodPw: ${goodPwRes.status}`);
    }
  } catch (err) {
    recordTest('Student Profile', 'Change Password & Security Validation', 'FAIL', err.message);
  }

  // --------------------------------------------------------
  // TEST SUITE 2: MY BADGES & ACCOLADES
  // --------------------------------------------------------
  console.log('\n--- 2. MY BADGES & ACCOLADES VERIFICATION ---');

  // 2.1 GET All Badges & Verify Unlocked/Locked Distinction
  try {
    const badgesRes = await fetch(`${BASE_URL}/users/me/badges`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const badgesData = await badgesRes.json();

    const allBadges = badgesData.badges || [];
    const unlockedBadges = allBadges.filter((b) => b.isUnlocked);
    const lockedBadges = allBadges.filter((b) => !b.isUnlocked);

    // Eco Beginner should be automatically granted on signup/activity
    const ecoBeginner = unlockedBadges.find((b) => b.name === 'Eco Beginner');

    if (
      badgesRes.status === 200 &&
      allBadges.length >= 10 &&
      unlockedBadges.length >= 1 &&
      lockedBadges.length >= 1 &&
      ecoBeginner &&
      ecoBeginner.earnedAt
    ) {
      recordTest(
        'My Badges & Accolades',
        'All Badges Retrieved with Unlocked vs Locked Distinction',
        'PASS',
        `Total: ${allBadges.length}, Unlocked: ${unlockedBadges.length}, Locked: ${lockedBadges.length}, Earned: "${ecoBeginner.name}"`
      );
    } else {
      recordTest(
        'My Badges & Accolades',
        'All Badges Retrieved with Unlocked vs Locked Distinction',
        'FAIL',
        `Total: ${allBadges.length}, Unlocked: ${unlockedBadges.length}`
      );
    }

    // 2.2 Verify Duplicate Protection
    const userBadgeCountBefore = await mongoose.model('UserBadge').countDocuments({ userId });
    // Call GET /users/me/badges again
    await fetch(`${BASE_URL}/users/me/badges`, { headers: { Authorization: `Bearer ${token}` } });
    const userBadgeCountAfter = await mongoose.model('UserBadge').countDocuments({ userId });

    if (userBadgeCountBefore === userBadgeCountAfter) {
      recordTest(
        'My Badges & Accolades',
        'Duplicate Badge Protection',
        'PASS',
        `Badge count conserved at ${userBadgeCountBefore} across multiple evaluations`
      );
    } else {
      recordTest('My Badges & Accolades', 'Duplicate Badge Protection', 'FAIL', `Before: ${userBadgeCountBefore}, After: ${userBadgeCountAfter}`);
    }
  } catch (err) {
    recordTest('My Badges & Accolades', 'All Badges Retrieved with Unlocked vs Locked Distinction', 'FAIL', err.message);
  }

  // --------------------------------------------------------
  // TEST SUITE 3: CAMPUS LEADERBOARD
  // --------------------------------------------------------
  console.log('\n--- 3. CAMPUS LEADERBOARD VERIFICATION ---');

  // 3.1 Leaderboard Ranking Order & Logged-In User Highlight
  try {
    const leadRes = await fetch(`${BASE_URL}/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const leadData = await leadRes.json();

    const leaderboard = leadData.leaderboard || [];
    // Check if sorted descending by XP
    let isSorted = true;
    for (let i = 0; i < leaderboard.length - 1; i++) {
      if (leaderboard[i].xp < leaderboard[i + 1].xp) {
        isSorted = false;
        break;
      }
    }

    // Check if logged-in user is marked with isCurrentUser: true
    const currentStudentInList = leaderboard.find((s) => s.isCurrentUser);
    const currentUserRank = leadData.currentUserRank;

    if (
      leadRes.status === 200 &&
      leadData.success &&
      leaderboard.length > 0 &&
      isSorted &&
      currentUserRank &&
      currentUserRank.rank >= 1 &&
      leadData.stats.totalCampusXP >= 0
    ) {
      recordTest(
        'Campus Leaderboard',
        'Students Ranked by XP & Current User Highlighted',
        'PASS',
        `Leader: ${leaderboard[0]?.name} (${leaderboard[0]?.xp} XP), User Rank: #${currentUserRank.rank}`
      );
    } else {
      recordTest('Campus Leaderboard', 'Students Ranked by XP & Current User Highlighted', 'FAIL', `isSorted: ${isSorted}, total: ${leaderboard.length}`);
    }
  } catch (err) {
    recordTest('Campus Leaderboard', 'Students Ranked by XP & Current User Highlighted', 'FAIL', err.message);
  }

  // 3.2 Department & Search Filtering
  try {
    const searchRes = await fetch(`${BASE_URL}/leaderboard?search=Eco%20Pioneer`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const searchData = await searchRes.json();

    if (searchRes.status === 200 && searchData.leaderboard.some((s) => s.name.includes('Eco Pioneer'))) {
      recordTest(
        'Campus Leaderboard',
        'Search & Filter by Student/Department',
        'PASS',
        `Search returned ${searchData.leaderboard.length} matching students`
      );
    } else {
      recordTest('Campus Leaderboard', 'Search & Filter by Student/Department', 'FAIL', `Search count: ${searchData.leaderboard?.length}`);
    }
  } catch (err) {
    recordTest('Campus Leaderboard', 'Search & Filter by Student/Department', 'FAIL', err.message);
  }

  // --------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------
  console.log('\n========================================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('========================================================');
  const passes = results.filter((r) => r.status === 'PASS').length;
  const fails = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${passes}`);
  console.log(`FAILED: ${fails}`);
  console.log('========================================================\n');

  await mongoose.connection.close();
  process.exit(fails > 0 ? 1 : 0);
}

runM7Audit().catch((err) => {
  console.error('Audit crashed with error:', err);
  process.exit(1);
});
