/**
 * PUNCH-CLOCK Migration Script
 * 
 * Migrates existing PUNCH-CLOCK PostgreSQL/Prisma database to unified schema
 * 
 * Usage:
 *   tsx migrations/punch-clock-migration.ts
 */

import { PrismaClient as OldPrismaClient } from '@prisma/client'; // Old schema client
import { PrismaClient, EmploymentType, AttendanceMethod, AttendanceStatus, ShiftType, LeaveType, LeaveStatus } from '@prisma/client'; // New unified client

const oldDb = new OldPrismaClient({
  datasourceUrl: process.env.OLD_PUNCH_CLOCK_DATABASE_URL,
});

const newDb = new PrismaClient();

async function migratePunchClock() {
  console.log('🔄 Starting PUNCH-CLOCK migration...');

  try {
    // Step 1: Map old organization to new organization
    console.log('📋 Step 1: Migrating organization...');
    
    // This assumes there's an existing organization or creates one
    // You'll need to adjust based on your old schema
    const oldOrg = await oldDb.$queryRaw`SELECT * FROM organizations LIMIT 1`;
    
    let newOrg;
    if (oldOrg && Array.isArray(oldOrg) && oldOrg.length > 0) {
      const org = oldOrg[0] as any;
      newOrg = await newDb.organization.upsert({
        where: { slug: org.slug || 'migrated-org' },
        update: {},
        create: {
          name: org.name || 'Migrated Organization',
          slug: org.slug || 'migrated-org',
          plan: 'PRO',
          status: 'ACTIVE',
          settings: org.settings || {},
        },
      });
      console.log(`✅ Organization migrated: ${newOrg.name}`);
    }

    // Step 2: Migrate users
    console.log('📋 Step 2: Migrating users...');
    const oldUsers = await oldDb.$queryRaw`SELECT * FROM users`;
    
    if (Array.isArray(oldUsers)) {
      for (const oldUser of oldUsers as any[]) {
        await newDb.user.upsert({
          where: { email: oldUser.email },
          update: {},
          create: {
            id: oldUser.id,
            organizationId: newOrg!.id,
            email: oldUser.email,
            name: oldUser.name,
            passwordHash: oldUser.password_hash,
            role: oldUser.role || 'MEMBER',
            status: oldUser.status || 'ACTIVE',
            createdAt: oldUser.created_at,
            updatedAt: oldUser.updated_at,
          },
        });
      }
      console.log(`✅ Migrated ${oldUsers.length} users`);
    }

    // Step 3: Migrate employees
    console.log('📋 Step 3: Migrating employees...');
    const oldEmployees = await oldDb.$queryRaw`SELECT * FROM employees`;
    
    if (Array.isArray(oldEmployees)) {
      for (const oldEmp of oldEmployees as any[]) {
        await newDb.employee.create({
          data: {
            id: oldEmp.id,
            organizationId: newOrg!.id,
            userId: oldEmp.user_id,
            firstName: oldEmp.first_name,
            lastName: oldEmp.last_name,
            email: oldEmp.email,
            position: oldEmp.position,
            department: oldEmp.department,
            employmentType: oldEmp.employment_type as EmploymentType || EmploymentType.FULL_TIME,
            salary: oldEmp.salary,
            status: oldEmp.status || 'ACTIVE',
            hireDate: oldEmp.hire_date,
            createdAt: oldEmp.created_at,
            updatedAt: oldEmp.updated_at,
          },
        });
      }
      console.log(`✅ Migrated ${oldEmployees.length} employees`);
    }

    // Step 4: Migrate attendance records
    console.log('📋 Step 4: Migrating attendance records...');
    const oldAttendances = await oldDb.$queryRaw`SELECT * FROM attendance_records`;
    
    if (Array.isArray(oldAttendances)) {
      for (const oldAtt of oldAttendances as any[]) {
        await newDb.attendance.create({
          data: {
            id: oldAtt.id,
            employeeId: oldAtt.employee_id,
            checkInTime: oldAtt.check_in_time,
            checkOutTime: oldAtt.check_out_time,
            method: oldAtt.method as AttendanceMethod || AttendanceMethod.PIN,
            location: oldAtt.location,
            status: oldAtt.status as AttendanceStatus || AttendanceStatus.PRESENT,
            notes: oldAtt.notes,
            createdAt: oldAtt.created_at,
            updatedAt: oldAtt.updated_at,
          },
        });
      }
      console.log(`✅ Migrated ${oldAttendances.length} attendance records`);
    }

    // Step 5: Migrate shifts
    console.log('📋 Step 5: Migrating shifts...');
    const oldShifts = await oldDb.$queryRaw`SELECT * FROM shifts`;
    
    if (Array.isArray(oldShifts)) {
      for (const oldShift of oldShifts as any[]) {
        await newDb.shift.create({
          data: {
            id: oldShift.id,
            employeeId: oldShift.employee_id,
            startTime: oldShift.start_time,
            endTime: oldShift.end_time,
            type: oldShift.type as ShiftType || ShiftType.MORNING,
            notes: oldShift.notes,
            createdAt: oldShift.created_at,
            updatedAt: oldShift.updated_at,
          },
        });
      }
      console.log(`✅ Migrated ${oldShifts.length} shifts`);
    }

    // Step 6: Migrate leave requests
    console.log('📋 Step 6: Migrating leave requests...');
    const oldLeaves = await oldDb.$queryRaw`SELECT * FROM leave_requests`;
    
    if (Array.isArray(oldLeaves)) {
      for (const oldLeave of oldLeaves as any[]) {
        await newDb.leave.create({
          data: {
            id: oldLeave.id,
            employeeId: oldLeave.employee_id,
            type: oldLeave.type as LeaveType || LeaveType.CASUAL,
            startDate: oldLeave.start_date,
            endDate: oldLeave.end_date,
            status: oldLeave.status as LeaveStatus || LeaveStatus.PENDING,
            reason: oldLeave.reason,
            createdAt: oldLeave.created_at,
            updatedAt: oldLeave.updated_at,
          },
        });
      }
      console.log(`✅ Migrated ${oldLeaves.length} leave requests`);
    }

    // Step 7: Migrate payroll records
    console.log('📋 Step 7: Migrating payroll records...');
    const oldPayrolls = await oldDb.$queryRaw`SELECT * FROM payrolls`;
    
    if (Array.isArray(oldPayrolls)) {
      for (const oldPayroll of oldPayrolls as any[]) {
        await newDb.payroll.create({
          data: {
            id: oldPayroll.id,
            employeeId: oldPayroll.employee_id,
            period: oldPayroll.period,
            grossPay: oldPayroll.gross_pay,
            netPay: oldPayroll.net_pay,
            deductions: oldPayroll.deductions,
            bonus: oldPayroll.bonus,
            createdAt: oldPayroll.created_at,
            updatedAt: oldPayroll.updated_at,
          },
        });
      }
      console.log(`✅ Migrated ${oldPayrolls.length} payroll records`);
    }

    console.log('✅ PUNCH-CLOCK migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migratePunchClock()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migratePunchClock };
