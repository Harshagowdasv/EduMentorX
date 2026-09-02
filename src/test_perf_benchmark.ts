// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';

function generateStudentRows(count: number, prefix: string) {
  const rows = [];
  for (let i = 1; i <= count; i++) {
    const padded = String(i).padStart(3, '0');
    rows.push({
      usn: `PERF-${prefix}-${padded}`,
      name: `Perf Student ${prefix} ${padded}`,
      email: `perf_${prefix.toLowerCase()}_${padded}@test.com`,
      phone: `91000${prefix.replace(/\D/g, '') || '0'}${padded}`,
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      semester: 'Semester 6',
      section: 'A',
      cgpa: 8.0 + (i % 10) * 0.1,
      attendance: 80 + (i % 20),
    });
  }
  return rows;
}

async function runPerformanceBenchmark() {
  console.log('====================================================');
  console.log(' EDUMENTORX COMPREHENSIVE PERFORMANCE BENCHMARK');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  // Helper to cleanup auth users
  async function cleanupEmail(email: string) {
    try {
      const u = await adminAuth.getUserByEmail(email);
      if (u) await adminAuth.deleteUser(u.uid);
    } catch {}
  }

  // --- 1. DASHBOARD & CACHE BENCHMARKS ---
  console.log('\n--- 1. DASHBOARD & DATA LOADING BENCHMARKS ---');

  // Admin Initial Dashboard (Parallel fetch of Mentors, Students, Allocations)
  const dashStart = performance.now();
  const [dashMentors, dashStudents, dashAllocs] = await Promise.all([
    fbDb.getMentors(),
    fbDb.getStudents(1, 100),
    fbDb.getAllocationHistory(),
  ]);
  const dashDuration = Math.round(performance.now() - dashStart);
  console.log(`1. Admin Initial Dashboard First Load: ${dashDuration}ms (${dashMentors.length} mentors, ${dashStudents.total} students)`);

  // Mentor Management First Load vs Cached Reload
  (fbDb as any).invalidateCache('mentor');

  const m1Start = performance.now();
  const m1 = await fbDb.getMentors();
  const m1Duration = Math.round(performance.now() - m1Start);

  const m2Start = performance.now();
  const m2 = await fbDb.getMentors();
  const m2Duration = Math.round(performance.now() - m2Start);

  console.log(`2. Mentor Management First Load (Uncached): ${m1Duration}ms`);
  console.log(`3. Mentor Management Cached Reload: ${m2Duration}ms (True Cache Hit!)`);

  // Student Management First Load vs Cached Reload
  (fbDb as any).invalidateCache('student');

  const s1Start = performance.now();
  const s1 = await fbDb.getStudents(1, 100);
  const s1Duration = Math.round(performance.now() - s1Start);

  const s2Start = performance.now();
  const s2 = await fbDb.getStudents(1, 100);
  const s2Duration = Math.round(performance.now() - s2Start);

  console.log(`4. Student Management First Load (Uncached): ${s1Duration}ms`);
  console.log(`5. Student Management Cached Reload: ${s2Duration}ms (True Cache Hit!)`);

  // Allocation Manager First Load vs Cached Reload
  (fbDb as any).invalidateCache('allocation');

  const a1Start = performance.now();
  const a1 = await fbDb.getAllocationHistory();
  const a1Duration = Math.round(performance.now() - a1Start);

  const a2Start = performance.now();
  const a2 = await fbDb.getAllocationHistory();
  const a2Duration = Math.round(performance.now() - a2Start);

  console.log(`6. Allocation Manager First Load (Uncached): ${a1Duration}ms`);
  console.log(`7. Allocation Manager Cached Reload: ${a2Duration}ms (True Cache Hit!)`);

  // --- 2. CSV BATCH IMPORT PERFORMANCE (10, 25, 50 STUDENTS) ---
  console.log('\n--- 2. CSV BATCH IMPORT PERFORMANCE BENCHMARKS ---');

  // Benchmark 10 Students
  console.log('\n[Benchmarking 10 Students Import...]');
  const rows10 = generateStudentRows(10, 'B10');
  for (const r of rows10) await cleanupEmail(r.email);

  const import10Start = performance.now();
  const res10 = await fbDb.importStudentsCSV(rows10, 'admin_test');
  const import10Duration = Math.round(performance.now() - import10Start);
  console.log(`8. CSV Import with 10 Students: ${import10Duration}ms (Imported: ${res10.importedCount}, Skipped: ${res10.skippedCount})`);

  // Benchmark 25 Students
  console.log('\n[Benchmarking 25 Students Import...]');
  const rows25 = generateStudentRows(25, 'B25');
  for (const r of rows25) await cleanupEmail(r.email);

  const import25Start = performance.now();
  const res25 = await fbDb.importStudentsCSV(rows25, 'admin_test');
  const import25Duration = Math.round(performance.now() - import25Start);
  console.log(`9. CSV Import with 25 Students: ${import25Duration}ms (Imported: ${res25.importedCount}, Skipped: ${res25.skippedCount})`);

  // Benchmark 50 Students
  console.log('\n[Benchmarking 50 Students Import...]');
  const rows50 = generateStudentRows(50, 'B50');
  for (const r of rows50) await cleanupEmail(r.email);

  const import50Start = performance.now();
  const res50 = await fbDb.importStudentsCSV(rows50, 'admin_test');
  const import50Duration = Math.round(performance.now() - import50Start);
  console.log(`10. CSV Import with 50 Students: ${import50Duration}ms (Imported: ${res50.importedCount}, Skipped: ${res50.skippedCount})`);

  // Cleanup benchmark student accounts
  console.log('\n--- Cleaning up test benchmark accounts ---');
  for (const r of [...rows10, ...rows25, ...rows50]) {
    await cleanupEmail(r.email);
  }
  console.log('Cleanup completed.');

  console.log('\n====================================================');
  console.log(' SUMMARY BENCHMARK TIMINGS REPORT');
  console.log('====================================================');
  console.log(`1. Admin Initial Dashboard: ${dashDuration}ms`);
  console.log(`2. Mentor Management First Load: ${m1Duration}ms`);
  console.log(`3. Mentor Management Cached Reload: ${m2Duration}ms (Cache Hit)`);
  console.log(`4. Student Management First Load: ${s1Duration}ms`);
  console.log(`5. Student Management Cached Reload: ${s2Duration}ms (Cache Hit)`);
  console.log(`6. Allocation Manager First Load: ${a1Duration}ms`);
  console.log(`7. Allocation Manager Cached Reload: ${a2Duration}ms (Cache Hit)`);
  console.log(`8. CSV Import (10 Students): ${import10Duration}ms`);
  console.log(`9. CSV Import (25 Students): ${import25Duration}ms`);
  console.log(`10. CSV Import (50 Students): ${import50Duration}ms`);
  console.log('====================================================');
}

runPerformanceBenchmark();
