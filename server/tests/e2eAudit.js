const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Configure test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
process.env.PORT = process.env.TEST_PORT || '5055';

const PORT = process.env.PORT;
const BASE_URL = `http://localhost:${PORT}/api`;

const results = [];

function recordTest(suite, name, status, details = '') {
  results.push({ suite, name, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${suite}] ${name}: ${status} ${details ? '(' + details + ')' : ''}`);
}

async function runAudit() {
  console.log('====================================================');
  console.log('🌿 GREEN CAMPUS CONNECT — END-TO-END INTEGRATION AUDIT');
  console.log('====================================================\n');

  // Start the server by importing server.js
  const app = require('../server');
  
  // Wait for DB connection
  let dbConnected = false;
  for (let i = 0; i < 20; i++) {
    if (mongoose.connection.readyState === 1) {
      dbConnected = true;
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  if (dbConnected) {
    recordTest('Database', 'MongoDB Atlas Connection', 'PASS', 'State: connected');
  } else {
    recordTest('Database', 'MongoDB Atlas Connection', 'FAIL', 'Connection timeout');
    process.exit(1);
  }

  // Define unique test student details
  const timestamp = Date.now();
  const testStudent = {
    name: `Audit Student ${timestamp}`,
    email: `audit.student.${timestamp}@greencampus.edu`,
    password: 'Password@123',
  };

  let studentToken = '';
  let studentUser = null;
  let adminToken = '';
  let adminUser = null;

  // ----------------------------------------------------
  // 1. AUTHENTICATION TESTS
  // ----------------------------------------------------
  console.log('\n--- 1. AUTHENTICATION AUDIT ---');

  // 1.1 Register New Student
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent),
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.token && data.user) {
      studentToken = data.token;
      studentUser = data.user;
      recordTest('Authentication', 'Register New Student', 'PASS', `Created user ${studentUser.email}`);
    } else {
      recordTest('Authentication', 'Register New Student', 'FAIL', data.message || 'Status ' + res.status);
    }
  } catch (err) {
    recordTest('Authentication', 'Register New Student', 'FAIL', err.message);
  }

  // 1.2 Log in & Verify JWT Authentication
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testStudent.email, password: testStudent.password }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.token) {
      // Verify token with GET /auth/me
      const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const meData = await meRes.json();
      if (meRes.status === 200 && meData.success && meData.user.email === testStudent.email) {
        recordTest('Authentication', 'Log in and verify JWT authentication', 'PASS', 'Verified JWT on /api/auth/me');
      } else {
        recordTest('Authentication', 'Log in and verify JWT authentication', 'FAIL', 'Failed to authenticate on /me');
      }
    } else {
      recordTest('Authentication', 'Log in and verify JWT authentication', 'FAIL', data.message || 'Status ' + res.status);
    }
  } catch (err) {
    recordTest('Authentication', 'Log in and verify JWT authentication', 'FAIL', err.message);
  }

  // 1.3 Verify Protected Routes (Without Token & With Invalid Token)
  try {
    const noTokenRes = await fetch(`${BASE_URL}/users/me/dashboard`);
    const badTokenRes = await fetch(`${BASE_URL}/users/me/dashboard`, {
      headers: { Authorization: 'Bearer this_is_an_invalid_token_signature' },
    });
    if (noTokenRes.status === 401 && badTokenRes.status === 401) {
      recordTest('Authentication', 'Verify Protected Routes Security', 'PASS', 'Both unauthenticated and invalid tokens returned 401');
    } else {
      recordTest('Authentication', 'Verify Protected Routes Security', 'FAIL', `noToken: ${noTokenRes.status}, badToken: ${badTokenRes.status}`);
    }
  } catch (err) {
    recordTest('Authentication', 'Verify Protected Routes Security', 'FAIL', err.message);
  }

  // 1.4 Verify Admin Role Restrictions
  try {
    // Student trying admin route
    const studentAttempt = await fetch(`${BASE_URL}/admin/submissions`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || 'admin@greencampus.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
      }),
    });
    const adminData = await adminLoginRes.json();
    if (adminData.token) {
      adminToken = adminData.token;
      adminUser = adminData.user;
    }

    const adminAttempt = await fetch(`${BASE_URL}/admin/submissions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (studentAttempt.status === 403 && adminAttempt.status === 200) {
      recordTest('Authentication', 'Verify Admin Role Restrictions', 'PASS', 'Student received 403 Forbidden; Admin received 200 OK');
    } else {
      recordTest('Authentication', 'Verify Admin Role Restrictions', 'FAIL', `Student status: ${studentAttempt.status}, Admin status: ${adminAttempt.status}`);
    }
  } catch (err) {
    recordTest('Authentication', 'Verify Admin Role Restrictions', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // 2. LEARNING JOURNEY TESTS
  // ----------------------------------------------------
  console.log('\n--- 2. LEARNING JOURNEY AUDIT ---');

  let module1 = null;
  let module2 = null;

  // 2.1 Open the Learning Map & Check Initial Destination States
  try {
    const res = await fetch(`${BASE_URL}/modules`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.modules) && data.modules.length === 5) {
      module1 = data.modules[0];
      module2 = data.modules[1];
      const dest1Unlocked = !module1.isLocked;
      const restLocked = data.modules.slice(1).every(m => m.isLocked);

      if (dest1Unlocked && restLocked) {
        recordTest('Learning Journey', 'Learning Map 5 Destinations & Initial States', 'PASS', `Destination 1 ("${module1.destination}") unlocked; Destinations 2-5 locked`);
      } else {
        recordTest('Learning Journey', 'Learning Map 5 Destinations & Initial States', 'FAIL', `Initial lock states incorrect: mod1Locked=${module1.isLocked}`);
      }
    } else {
      recordTest('Learning Journey', 'Learning Map 5 Destinations & Initial States', 'FAIL', `Expected 5 modules, got ${data.modules?.length}`);
    }
  } catch (err) {
    recordTest('Learning Journey', 'Learning Map 5 Destinations & Initial States', 'FAIL', err.message);
  }

  // 2.2 Complete Lesson Reading & Submit Quiz with Backend Scoring
  let initialStudentXP = 0;
  try {
    // Check initial student XP
    const userDoc = await mongoose.model('User').findById(studentUser._id || studentUser.id);
    initialStudentXP = userDoc.xp;

    // Fetch quiz from DB to obtain correct answers for Destination 1
    const LearningModuleModel = mongoose.model('LearningModule');
    const fullMod1 = await LearningModuleModel.findById(module1._id);

    const correctAnswers = fullMod1.quizQuestions.map((q, idx) => ({
      questionIndex: idx,
      selectedAnswer: q.correctAnswer,
    }));

    const quizRes = await fetch(`${BASE_URL}/quizzes/${module1._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ answers: correctAnswers }),
    });
    const quizData = await quizRes.json();

    if (quizRes.status === 200 && quizData.success && quizData.passed && quizData.percentage === 100) {
      recordTest('Learning Journey', 'Backend Quiz Scoring & Pass Evaluation', 'PASS', `Scored 100% (${quizData.score}/${quizData.totalQuestions}), passed=true`);
    } else {
      recordTest('Learning Journey', 'Backend Quiz Scoring & Pass Evaluation', 'FAIL', `Passed: ${quizData.passed}, Score: ${quizData.score}`);
    }

    // 2.3 Verify XP Awarded Exactly Once (Duplicate Protection)
    const userDocAfter = await mongoose.model('User').findById(studentUser._id || studentUser.id);
    const xpDifference = userDocAfter.xp - initialStudentXP;
    const expectedXP = fullMod1.xpReward;

    // Resubmit same quiz to test duplicate prevention
    const duplicateRes = await fetch(`${BASE_URL}/quizzes/${module1._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ answers: correctAnswers }),
    });
    const duplicateData = await duplicateRes.json();
    const userDocAfterDuplicate = await mongoose.model('User').findById(studentUser._id || studentUser.id);

    if (xpDifference === expectedXP && duplicateData.xpEarned === 0 && userDocAfterDuplicate.xp === userDocAfter.xp) {
      recordTest('Learning Journey', 'Award XP Exactly Once (Duplicate Protection)', 'PASS', `First attempt +${xpDifference} XP; Second attempt +0 XP`);
    } else {
      recordTest('Learning Journey', 'Award XP Exactly Once (Duplicate Protection)', 'FAIL', `Expected +${expectedXP} XP once. Diff1: ${xpDifference}, Diff2: ${userDocAfterDuplicate.xp - userDocAfter.xp}`);
    }
  } catch (err) {
    recordTest('Learning Journey', 'Backend Quiz Scoring & Pass Evaluation', 'FAIL', err.message);
    recordTest('Learning Journey', 'Award XP Exactly Once (Duplicate Protection)', 'FAIL', err.message);
  }

  // 2.4 Verify Next Destination Unlocks
  try {
    const res = await fetch(`${BASE_URL}/modules`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const data = await res.json();
    const updatedMod1 = data.modules[0];
    const updatedMod2 = data.modules[1];

    if (updatedMod1.isCompleted && !updatedMod2.isLocked) {
      recordTest('Learning Journey', 'Unlock Next Destination After Completion', 'PASS', `Destination 1 completed; Destination 2 ("${updatedMod2.destination}") now unlocked`);
    } else {
      recordTest('Learning Journey', 'Unlock Next Destination After Completion', 'FAIL', `Mod1 completed: ${updatedMod1.isCompleted}, Mod2 locked: ${updatedMod2.isLocked}`);
    }
  } catch (err) {
    recordTest('Learning Journey', 'Unlock Next Destination After Completion', 'FAIL', err.message);
  }

  // 2.5 Refresh & Relogin to Verify Persistence
  try {
    // Obtain fresh token via login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testStudent.email, password: testStudent.password }),
    });
    const loginData = await loginRes.json();
    const freshToken = loginData.token;

    const modulesRes = await fetch(`${BASE_URL}/modules`, {
      headers: { Authorization: `Bearer ${freshToken}` },
    });
    const modulesData = await modulesRes.json();

    const prog1 = modulesData.modules[0];
    const prog2 = modulesData.modules[1];

    if (prog1.isCompleted && !prog2.isLocked) {
      recordTest('Learning Journey', 'Progression Persistence on Refresh & Re-login', 'PASS', 'Progression verified active across fresh session');
    } else {
      recordTest('Learning Journey', 'Progression Persistence on Refresh & Re-login', 'FAIL', 'State lost after re-login');
    }
  } catch (err) {
    recordTest('Learning Journey', 'Progression Persistence on Refresh & Re-login', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // 3. CHALLENGES AUDIT
  // ----------------------------------------------------
  console.log('\n--- 3. CHALLENGES AUDIT ---');

  let testChallenge1 = null;
  let testChallenge2 = null;
  let submission1Id = null;

  // 3.1 Join a Challenge (Verify 0 XP on Join)
  try {
    const chListRes = await fetch(`${BASE_URL}/challenges`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const chListData = await chListRes.json();
    testChallenge1 = chListData.challenges[0];
    testChallenge2 = chListData.challenges[1];

    const xpBeforeJoin = (await mongoose.model('User').findById(studentUser._id || studentUser.id)).xp;

    const joinRes = await fetch(`${BASE_URL}/challenges/${testChallenge1._id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const joinData = await joinRes.json();

    const xpAfterJoin = (await mongoose.model('User').findById(studentUser._id || studentUser.id)).xp;

    if (joinRes.status === 200 && joinData.success && xpBeforeJoin === xpAfterJoin) {
      recordTest('Challenges', 'Join Challenge (0 XP Awarded on Join)', 'PASS', `Joined "${testChallenge1.title}", XP unchanged (${xpBeforeJoin})`);
    } else {
      recordTest('Challenges', 'Join Challenge (0 XP Awarded on Join)', 'FAIL', `Status: ${joinRes.status}, XP diff: ${xpAfterJoin - xpBeforeJoin}`);
    }
  } catch (err) {
    recordTest('Challenges', 'Join Challenge (0 XP Awarded on Join)', 'FAIL', err.message);
  }

  // 3.2 Submit Photo Evidence & Verify Pending Status (0 XP on Submit)
  try {
    const xpBeforeSubmit = (await mongoose.model('User').findById(studentUser._id || studentUser.id)).xp;

    const submitRes = await fetch(`${BASE_URL}/challenges/${testChallenge1._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        description: 'Placed dry recyclable plastic items into the green recycling bin at campus center.',
        imageUrl: '/uploads/test-evidence-photo.jpg',
      }),
    });
    const submitData = await submitRes.json();
    submission1Id = submitData.submission?._id;

    // Check participation status
    const partRes = await fetch(`${BASE_URL}/challenges/${testChallenge1._id}/participation`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const partData = await partRes.json();

    const xpAfterSubmit = (await mongoose.model('User').findById(studentUser._id || studentUser.id)).xp;

    if (submitRes.status === 201 && partData.participation?.submissionStatus === 'pending' && xpBeforeSubmit === xpAfterSubmit) {
      recordTest('Challenges', 'Submit Photo Evidence & Verify Pending Status', 'PASS', `Status is 'pending', XP unchanged (${xpBeforeSubmit})`);
    } else {
      recordTest('Challenges', 'Submit Photo Evidence & Verify Pending Status', 'FAIL', `Status: ${partData.participation?.submissionStatus}, XP diff: ${xpAfterSubmit - xpBeforeSubmit}`);
    }
  } catch (err) {
    recordTest('Challenges', 'Submit Photo Evidence & Verify Pending Status', 'FAIL', err.message);
  }

  // 3.3 Log in as Admin & Approve Submission (Verify XP Awarded from DB)
  try {
    const xpBeforeApprove = (await mongoose.model('User').findById(studentUser._id || studentUser.id)).xp;

    const approveRes = await fetch(`${BASE_URL}/admin/submissions/${submission1Id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approveData = await approveRes.json();

    const xpAfterApprove = (await mongoose.model('User').findById(studentUser._id || studentUser.id)).xp;
    const expectedReward = testChallenge1.rewardXP || 50;

    // Attempt duplicate approval
    const duplicateApproveRes = await fetch(`${BASE_URL}/admin/submissions/${submission1Id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const xpAfterDuplicateApprove = (await mongoose.model('User').findById(studentUser._id || studentUser.id)).xp;

    if (
      approveRes.status === 200 &&
      approveData.success &&
      xpAfterApprove - xpBeforeApprove === expectedReward &&
      duplicateApproveRes.status === 400 &&
      xpAfterDuplicateApprove === xpAfterApprove
    ) {
      recordTest('Challenges', 'Admin Approval & XP Award Exactly Once', 'PASS', `Awarded +${expectedReward} XP; Re-approval blocked with 400`);
    } else {
      recordTest('Challenges', 'Admin Approval & XP Award Exactly Once', 'FAIL', `Approval status: ${approveRes.status}, Diff: ${xpAfterApprove - xpBeforeApprove}, Duplicate status: ${duplicateApproveRes.status}`);
    }
  } catch (err) {
    recordTest('Challenges', 'Admin Approval & XP Award Exactly Once', 'FAIL', err.message);
  }

  // 3.4 Verify Dashboard & Leaderboard Updates
  try {
    const dashRes = await fetch(`${BASE_URL}/users/me/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const dashData = await dashRes.json();

    const leadRes = await fetch(`${BASE_URL}/leaderboard`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const leadData = await leadRes.json();

    const inLeaderboard = leadData.leaderboard?.some(u => u._id.toString() === (studentUser._id || studentUser.id).toString());

    const stats = dashData.dashboard?.stats;
    if (dashData.success && stats?.completedChallengesCount >= 1 && inLeaderboard) {
      recordTest('Challenges', 'Dashboard and Leaderboard Metrics Updates', 'PASS', `Dashboard completedChallenges: ${stats.completedChallengesCount}, Present in Leaderboard: true`);
    } else {
      recordTest('Challenges', 'Dashboard and Leaderboard Metrics Updates', 'FAIL', `Challenges count: ${stats?.completedChallengesCount}, In leaderboard: ${inLeaderboard}`);
    }
  } catch (err) {
    recordTest('Challenges', 'Dashboard and Leaderboard Metrics Updates', 'FAIL', err.message);
  }

  // 3.5 Test Rejection and Resubmission Flow
  try {
    // Student submits for challenge 2
    const submit2Res = await fetch(`${BASE_URL}/challenges/${testChallenge2._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        description: 'First attempt photo of water conservation fixture.',
        imageUrl: '/uploads/blurry-photo.jpg',
      }),
    });
    const submit2Data = await submit2Res.json();
    const submission2Id = submit2Data.submission?._id;

    // Admin rejects with reason
    const rejectRes = await fetch(`${BASE_URL}/admin/submissions/${submission2Id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        reason: 'Image is blurry and tap aerator cannot be clearly distinguished. Please resubmit a sharper photo.',
      }),
    });
    const rejectData = await rejectRes.json();

    // Verify rejection in student's participation
    const part2Res = await fetch(`${BASE_URL}/challenges/${testChallenge2._id}/participation`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const part2Data = await part2Res.json();

    // Student resubmits new evidence
    const resubmitRes = await fetch(`${BASE_URL}/challenges/${testChallenge2._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        description: 'Corrected high-resolution photo clearly documenting tap aerator installation.',
        imageUrl: '/uploads/sharp-photo.jpg',
      }),
    });
    const resubmitData = await resubmitRes.json();

    if (
      rejectRes.status === 200 &&
      part2Data.participation?.submissionStatus === 'rejected' &&
      part2Data.participation?.submission?.rejectReason.includes('blurry') &&
      resubmitRes.status === 200 &&
      resubmitData.submission?.status === 'pending' &&
      resubmitData.submission?.resubmissionCount === 1
    ) {
      recordTest('Challenges', 'Rejection with Feedback & Student Resubmission', 'PASS', 'Rejection feedback stored, status reset to pending, resubmissionCount=1');
    } else {
      recordTest('Challenges', 'Rejection with Feedback & Student Resubmission', 'FAIL', `RejectStatus: ${part2Data.participation?.submissionStatus}, ResubmitStatus: ${resubmitData.submission?.status}`);
    }
  } catch (err) {
    recordTest('Challenges', 'Rejection with Feedback & Student Resubmission', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // 4. DATABASE INTEGRITY AUDIT
  // ----------------------------------------------------
  console.log('\n--- 4. DATABASE INTEGRITY AUDIT ---');

  try {
    const UserModel = mongoose.model('User');
    const ModuleProgressModel = mongoose.model('ModuleProgress');
    const ChallengeSubmissionModel = mongoose.model('ChallengeSubmission');
    const ActivityLogModel = mongoose.model('ActivityLog');

    const dbUser = await UserModel.findById(studentUser._id || studentUser.id);
    const dbProgress = await ModuleProgressModel.find({ userId: dbUser._id });
    const dbSubmissions = await ChallengeSubmissionModel.find({ userId: dbUser._id });
    const dbActivities = await ActivityLogModel.find({ userId: dbUser._id });

    if (dbUser && dbProgress.length >= 1 && dbSubmissions.length >= 2 && dbActivities.length >= 3) {
      recordTest('Database', 'Student-Specific Records Integrity', 'PASS', `User, ${dbProgress.length} ModuleProgress, ${dbSubmissions.length} Submissions, ${dbActivities.length} Activities`);
    } else {
      recordTest('Database', 'Student-Specific Records Integrity', 'FAIL', `Missing expected DB records for user ${studentUser.email}`);
    }

    // Verify duplicate submission protection (pending submission cannot be duplicated)
    const duplicateSubmissionAttempt = await fetch(`${BASE_URL}/challenges/${testChallenge2._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        description: 'Duplicate spam attempt while pending',
        imageUrl: '/uploads/spam.jpg',
      }),
    });

    if (duplicateSubmissionAttempt.status === 400) {
      recordTest('Database', 'Duplicate Pending Submission Protection', 'PASS', 'Prevented duplicate submission while pending review (400)');
    } else {
      recordTest('Database', 'Duplicate Pending Submission Protection', 'FAIL', `Expected 400, got ${duplicateSubmissionAttempt.status}`);
    }
  } catch (err) {
    recordTest('Database', 'Student-Specific Records Integrity', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // 5. RUNTIME & SECURITY AUDIT
  // ----------------------------------------------------
  console.log('\n--- 5. RUNTIME & SECURITY AUDIT ---');

  // 5.1 Invalid Inputs (Missing Required Registration Fields)
  try {
    const invalidRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'incomplete@example.com' }), // missing name and password
    });
    if (invalidRegRes.status === 400) {
      recordTest('Security', 'Validation on Missing/Invalid Inputs', 'PASS', 'Rejected invalid registration with 400');
    } else {
      recordTest('Security', 'Validation on Missing/Invalid Inputs', 'FAIL', `Expected 400, got ${invalidRegRes.status}`);
    }
  } catch (err) {
    recordTest('Security', 'Validation on Missing/Invalid Inputs', 'FAIL', err.message);
  }

  // 5.2 Invalid Login Credentials
  try {
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testStudent.email, password: 'WrongPassword123!' }),
    });
    if (badLoginRes.status === 401) {
      recordTest('Security', 'Authentication on Invalid Credentials', 'PASS', 'Rejected invalid password with 401 Unauthorized');
    } else {
      recordTest('Security', 'Authentication on Invalid Credentials', 'FAIL', `Expected 401, got ${badLoginRes.status}`);
    }
  } catch (err) {
    recordTest('Security', 'Authentication on Invalid Credentials', 'FAIL', err.message);
  }

  // 5.3 Unauthorized Access on Protected Endpoints
  try {
    const unauthModuleRes = await fetch(`${BASE_URL}/modules`);
    const unauthSubmissionsRes = await fetch(`${BASE_URL}/admin/submissions`);
    if (unauthModuleRes.status === 401 && unauthSubmissionsRes.status === 401) {
      recordTest('Security', 'Unauthorized Access Enforcement', 'PASS', 'Both returned 401 Unauthorized without auth bearer');
    } else {
      recordTest('Security', 'Unauthorized Access Enforcement', 'FAIL', `Module: ${unauthModuleRes.status}, Submissions: ${unauthSubmissionsRes.status}`);
    }
  } catch (err) {
    recordTest('Security', 'Unauthorized Access Enforcement', 'FAIL', err.message);
  }

  // 5.4 Invalid Upload Validation (Missing file or invalid format)
  try {
    const emptyUploadRes = await fetch(`${BASE_URL}/submissions/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      // No multipart body attached
    });
    if (emptyUploadRes.status === 400) {
      recordTest('Security', 'Upload File Validation (Empty / Non-image)', 'PASS', 'Rejected empty upload with 400 Bad Request');
    } else {
      recordTest('Security', 'Upload File Validation (Empty / Non-image)', 'FAIL', `Expected 400, got ${emptyUploadRes.status}`);
    }
  } catch (err) {
    recordTest('Security', 'Upload File Validation (Empty / Non-image)', 'FAIL', err.message);
  }

  // 5.5 Secrets in Git Check
  try {
    const { execSync } = require('child_process');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
    const gitEnvTracked = execSync('git ls-files .env server/.env client/.env', { encoding: 'utf-8' }).trim();

    if (!gitEnvTracked) {
      recordTest('Security', 'Secrets / .env Omission in Version Control', 'PASS', 'No .env files tracked in Git repository');
    } else {
      recordTest('Security', 'Secrets / .env Omission in Version Control', 'FAIL', `Tracked env files found: ${gitEnvTracked}`);
    }
  } catch (err) {
    recordTest('Security', 'Secrets / .env Omission in Version Control', 'FAIL', err.message);
  }

  // Print Summary Table
  console.log('\n====================================================');
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('====================================================');
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  console.log(`TOTAL TESTS EXECUTED: ${results.length}`);
  console.log(`PASSED: ${passes}`);
  console.log(`FAILED: ${fails}`);
  console.log('====================================================\n');

  // Close server and DB connections
  await mongoose.connection.close();
  process.exit(fails > 0 ? 1 : 0);
}

runAudit().catch(err => {
  console.error('Audit crashed with error:', err);
  process.exit(1);
});
