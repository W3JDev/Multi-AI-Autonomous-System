import { PrismaClient, Plan, UserRole, EmploymentType, AttendanceMethod, AttendanceStatus, ShiftType, TableStatus, OrderStatus, TrainingDifficulty, SkillLevel, ApplicationStatus, AppointmentStatus, ServiceCategory, DietaryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.spaService.deleteMany();
    await prisma.jobApplication.deleteMany();
    await prisma.coverLetter.deleteMany();
    await prisma.resume.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.trainingSession.deleteMany();
    await prisma.staffMember.deleteMany();
    await prisma.trainingProgram.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.table.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.payroll.deleteMany();
    await prisma.leave.deleteMany();
    await prisma.shift.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
  }

  // Create demo organization
  console.log('🏢 Creating demo organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'W3JDev Demo',
      slug: 'w3jdev-demo',
      plan: Plan.PRO,
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
      },
    },
  });

  // Create users
  console.log('👥 Creating users...');
  const owner = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'owner@w3jdev.com',
      name: 'John Owner',
      role: UserRole.OWNER,
      passwordHash: 'hashed_password_here', // In production, use proper hashing
    },
  });

  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'admin@w3jdev.com',
      name: 'Jane Admin',
      role: UserRole.ADMIN,
      passwordHash: 'hashed_password_here',
    },
  });

  const member = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'user@w3jdev.com',
      name: 'Bob Member',
      role: UserRole.MEMBER,
      passwordHash: 'hashed_password_here',
    },
  });

  // Create subscription
  console.log('💳 Creating subscription...');
  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      plan: Plan.PRO,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // PUNCH-CLOCK: Create employees with attendance
  console.log('⏰ Seeding PUNCH-CLOCK data...');
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        organizationId: org.id,
        userId: owner.id,
        firstName: 'John',
        lastName: 'Owner',
        email: 'owner@w3jdev.com',
        position: 'CEO',
        department: 'Executive',
        employmentType: EmploymentType.FULL_TIME,
        salary: 150000,
        hireDate: new Date('2020-01-01'),
      },
    }),
    prisma.employee.create({
      data: {
        organizationId: org.id,
        userId: admin.id,
        firstName: 'Jane',
        lastName: 'Admin',
        email: 'admin@w3jdev.com',
        position: 'HR Manager',
        department: 'Human Resources',
        employmentType: EmploymentType.FULL_TIME,
        salary: 80000,
        hireDate: new Date('2021-03-15'),
      },
    }),
    prisma.employee.create({
      data: {
        organizationId: org.id,
        firstName: 'Alice',
        lastName: 'Developer',
        email: 'alice@w3jdev.com',
        position: 'Senior Developer',
        department: 'Engineering',
        employmentType: EmploymentType.FULL_TIME,
        salary: 95000,
        hireDate: new Date('2021-06-01'),
      },
    }),
    prisma.employee.create({
      data: {
        organizationId: org.id,
        firstName: 'Carlos',
        lastName: 'Designer',
        email: 'carlos@w3jdev.com',
        position: 'UI/UX Designer',
        department: 'Design',
        employmentType: EmploymentType.PART_TIME,
        salary: 45000,
        hireDate: new Date('2022-01-10'),
      },
    }),
    prisma.employee.create({
      data: {
        organizationId: org.id,
        firstName: 'Diana',
        lastName: 'Intern',
        email: 'diana@w3jdev.com',
        position: 'Marketing Intern',
        department: 'Marketing',
        employmentType: EmploymentType.INTERN,
        salary: 30000,
        hireDate: new Date('2024-09-01'),
      },
    }),
  ]);

  // Create attendance records for the past week
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(9, 0, 0, 0);

    for (const employee of employees) {
      await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          checkInTime: new Date(date),
          checkOutTime: new Date(date.getTime() + 8 * 60 * 60 * 1000), // 8 hours later
          method: AttendanceMethod.PIN,
          status: AttendanceStatus.PRESENT,
        },
      });
    }
  }

  // Create shifts
  for (const employee of employees.slice(0, 3)) {
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      date.setHours(9, 0, 0, 0);

      await prisma.shift.create({
        data: {
          employeeId: employee.id,
          startTime: new Date(date),
          endTime: new Date(date.getTime() + 8 * 60 * 60 * 1000),
          type: ShiftType.MORNING,
        },
      });
    }
  }

  // WaiterAi: Create restaurant with menu
  console.log('🍽️  Seeding WaiterAi data...');
  const restaurant = await prisma.restaurant.create({
    data: {
      organizationId: org.id,
      name: 'The Gourmet House',
      description: 'Fine dining experience with international cuisine',
      address: '123 Main Street, New York, NY 10001',
      phone: '+1-555-0123',
      email: 'info@gourmethouse.com',
      settings: {
        openingHours: '10:00-22:00',
        cuisine: 'International',
      },
    },
  });

  const menu = await prisma.menu.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Main Menu',
      description: 'Our signature dishes',
      isActive: true,
    },
  });

  const menuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        menuId: menu.id,
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh mozzarella and basil',
        aiDescription: 'A perfectly crispy thin crust topped with San Marzano tomatoes, fresh buffalo mozzarella, and aromatic basil leaves',
        price: 18.99,
        category: 'Main Course',
        dietary: [DietaryType.VEGETARIAN],
        allergens: ['gluten', 'dairy'],
        translations: {
          es: 'Pizza Margherita clásica con mozzarella fresca y albahaca',
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        menuId: menu.id,
        name: 'Grilled Salmon',
        description: 'Atlantic salmon with lemon butter sauce',
        aiDescription: 'Perfectly grilled Atlantic salmon fillet with a delicate lemon butter sauce, served with seasonal vegetables',
        price: 28.50,
        category: 'Main Course',
        dietary: [DietaryType.GLUTEN_FREE],
        allergens: ['fish'],
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        menuId: menu.id,
        name: 'Caesar Salad',
        description: 'Crispy romaine lettuce with Caesar dressing',
        price: 12.99,
        category: 'Appetizer',
        allergens: ['dairy', 'eggs'],
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        menuId: menu.id,
        name: 'Vegan Buddha Bowl',
        description: 'Quinoa, roasted vegetables, and tahini dressing',
        price: 16.99,
        category: 'Main Course',
        dietary: [DietaryType.VEGAN, DietaryType.GLUTEN_FREE],
        allergens: ['sesame'],
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        menuId: menu.id,
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center',
        price: 9.99,
        category: 'Dessert',
        allergens: ['gluten', 'dairy', 'eggs'],
      },
    }),
  ]);

  // Create tables
  const tables = await Promise.all([
    prisma.table.create({ data: { restaurantId: restaurant.id, number: 'T1', capacity: 2, status: TableStatus.AVAILABLE } }),
    prisma.table.create({ data: { restaurantId: restaurant.id, number: 'T2', capacity: 4, status: TableStatus.OCCUPIED } }),
    prisma.table.create({ data: { restaurantId: restaurant.id, number: 'T3', capacity: 4, status: TableStatus.AVAILABLE } }),
    prisma.table.create({ data: { restaurantId: restaurant.id, number: 'T4', capacity: 6, status: TableStatus.RESERVED } }),
  ]);

  // Create an order
  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: tables[1].id,
      customerName: 'Emily Johnson',
      total: 50.97,
      status: OrderStatus.CONFIRMED,
    },
  });

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuItemId: menuItems[0].id,
        quantity: 1,
        price: 18.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuItemId: menuItems[2].id,
        quantity: 2,
        price: 12.99,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuItemId: menuItems[4].id,
        quantity: 1,
        price: 9.99,
      },
    }),
  ]);

  // FlairAi: Create training programs
  console.log('🎓 Seeding FlairAi data...');
  const trainingPrograms = await Promise.all([
    prisma.trainingProgram.create({
      data: {
        organizationId: org.id,
        name: 'Customer Service Excellence',
        description: 'Learn the fundamentals of exceptional customer service',
        language: 'en',
        difficulty: TrainingDifficulty.BEGINNER,
        duration: 45,
        scenarios: [
          { id: 1, title: 'Handling Complaints', type: 'conversation' },
          { id: 2, title: 'Upselling Techniques', type: 'roleplay' },
        ],
      },
    }),
    prisma.trainingProgram.create({
      data: {
        organizationId: org.id,
        name: 'Advanced Sales Techniques',
        description: 'Master the art of closing deals',
        language: 'en',
        difficulty: TrainingDifficulty.ADVANCED,
        duration: 90,
        scenarios: [
          { id: 1, title: 'Negotiation Strategies', type: 'simulation' },
          { id: 2, title: 'Objection Handling', type: 'roleplay' },
        ],
      },
    }),
  ]);

  const staffMember = await prisma.staffMember.create({
    data: {
      userId: member.id,
      organizationId: org.id,
      firstName: 'Bob',
      lastName: 'Member',
      role: 'Sales Representative',
      language: 'en',
      skillLevel: SkillLevel.INTERMEDIATE,
    },
  });

  const session = await prisma.trainingSession.create({
    data: {
      programId: trainingPrograms[0].id,
      staffId: staffMember.id,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      score: 85,
      performance: {
        accuracy: 90,
        speed: 80,
        completeness: 85,
      },
      completed: true,
    },
  });

  await prisma.assessment.create({
    data: {
      sessionId: session.id,
      staffId: staffMember.id,
      score: 85,
      feedback: 'Great job! You demonstrated excellent customer service skills.',
      passedAt: new Date(),
    },
  });

  // Ai-Artisan: Create resumes
  console.log('📄 Seeding Ai-Artisan data...');
  const resumes = await Promise.all([
    prisma.resume.create({
      data: {
        organizationId: org.id,
        userId: member.id,
        title: 'Software Engineer Resume',
        content: {
          personalInfo: {
            name: 'Bob Member',
            email: 'user@w3jdev.com',
            phone: '+1-555-0456',
            location: 'San Francisco, CA',
          },
          summary: 'Experienced software engineer with 5+ years of full-stack development',
          experience: [
            {
              company: 'Tech Corp',
              position: 'Senior Developer',
              duration: '2020-2024',
              description: 'Led development of microservices architecture',
            },
          ],
          education: [
            {
              institution: 'State University',
              degree: 'BS Computer Science',
              year: '2019',
            },
          ],
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        },
        aiOptimized: true,
        atsScore: 92,
        targetJob: 'Senior Software Engineer',
        keywords: ['software', 'engineering', 'full-stack', 'leadership'],
        template: 'modern',
      },
    }),
    prisma.resume.create({
      data: {
        organizationId: org.id,
        userId: owner.id,
        title: 'Executive Leadership Resume',
        content: {
          personalInfo: {
            name: 'John Owner',
            email: 'owner@w3jdev.com',
            phone: '+1-555-0789',
            location: 'New York, NY',
          },
          summary: 'Visionary CEO with 15+ years of experience building successful tech companies',
          experience: [
            {
              company: 'W3JDev',
              position: 'CEO & Founder',
              duration: '2020-Present',
              description: 'Built multi-AI ecosystem serving 10,000+ customers',
            },
          ],
        },
        aiOptimized: true,
        atsScore: 95,
        targetJob: 'Chief Executive Officer',
        keywords: ['leadership', 'strategy', 'innovation', 'growth'],
        template: 'executive',
      },
    }),
  ]);

  await prisma.coverLetter.create({
    data: {
      resumeId: resumes[0].id,
      jobTitle: 'Senior Software Engineer',
      company: 'Google',
      jobDescription: 'Looking for an experienced full-stack engineer...',
      content: 'Dear Hiring Manager,\n\nI am excited to apply for the Senior Software Engineer position...',
      tone: 'professional',
    },
  });

  await prisma.jobApplication.create({
    data: {
      userId: member.id,
      resumeId: resumes[0].id,
      company: 'Google',
      position: 'Senior Software Engineer',
      status: ApplicationStatus.APPLIED,
      appliedAt: new Date(),
      notes: 'Applied through company website',
    },
  });

  // Serene-AI: Create spa services and appointments
  console.log('💆 Seeding Serene-AI data...');
  const spaServices = await Promise.all([
    prisma.spaService.create({
      data: {
        organizationId: org.id,
        name: 'Swedish Massage',
        description: 'Relaxing full-body massage using gentle pressure',
        duration: 60,
        price: 89.99,
        category: ServiceCategory.MASSAGE,
      },
    }),
    prisma.spaService.create({
      data: {
        organizationId: org.id,
        name: 'Deep Tissue Massage',
        description: 'Therapeutic massage targeting deep muscle layers',
        duration: 90,
        price: 129.99,
        category: ServiceCategory.MASSAGE,
      },
    }),
    prisma.spaService.create({
      data: {
        organizationId: org.id,
        name: 'Anti-Aging Facial',
        description: 'Rejuvenating facial treatment for mature skin',
        duration: 75,
        price: 110.00,
        category: ServiceCategory.FACIAL,
      },
    }),
  ]);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  await Promise.all([
    prisma.appointment.create({
      data: {
        serviceId: spaServices[0].id,
        customerName: 'Sarah Williams',
        customerEmail: 'sarah@example.com',
        customerPhone: '+1-555-0111',
        appointmentDate: tomorrow,
        duration: 60,
        status: AppointmentStatus.CONFIRMED,
        notes: 'First-time customer, prefers medium pressure',
      },
    }),
    prisma.appointment.create({
      data: {
        serviceId: spaServices[2].id,
        customerName: 'Michael Brown',
        customerEmail: 'michael@example.com',
        customerPhone: '+1-555-0222',
        appointmentDate: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
        duration: 75,
        status: AppointmentStatus.SCHEDULED,
      },
    }),
  ]);

  // Create notifications
  console.log('🔔 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        organizationId: org.id,
        userId: owner.id,
        title: 'Welcome to W3JDev!',
        message: 'Your account has been successfully created.',
        type: 'SUCCESS',
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        organizationId: org.id,
        userId: member.id,
        title: 'Training Complete',
        message: 'You have completed the Customer Service Excellence course!',
        type: 'SUCCESS',
        link: '/training/sessions',
      },
    }),
  ]);

  // Create audit logs
  console.log('📝 Creating audit logs...');
  await Promise.all([
    prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: owner.id,
        action: 'CREATE',
        entity: 'organization',
        entityId: org.id,
        changes: { name: 'W3JDev Demo' },
        ipAddress: '192.168.1.1',
      },
    }),
    prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: admin.id,
        action: 'CREATE',
        entity: 'employee',
        entityId: employees[0].id,
        changes: { firstName: 'John', lastName: 'Owner' },
        ipAddress: '192.168.1.2',
      },
    }),
  ]);

  console.log('✅ Database seed completed successfully!');
  console.log(`
  📊 Summary:
  - Organization: ${org.name} (${org.slug})
  - Users: 3 (1 owner, 1 admin, 1 member)
  - Employees: ${employees.length}
  - Restaurant: ${restaurant.name} with ${menuItems.length} menu items
  - Training Programs: ${trainingPrograms.length}
  - Resumes: ${resumes.length}
  - Spa Services: ${spaServices.length}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
