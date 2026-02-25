import { prisma } from "./prisma";
import {
  PrismaClient,
  UserRole,
  LeaveType,
  PatientType,
  AppointmentStatus,
  TransactionStatus,
} from "../lib/generated/prisma/client";

async function main() {
  console.log("🚀 Seeding 10+ records per table...");

  // 1. Departments (Medical Specialties)
  const departments = [
    { name: "Cardiology", iconName: "heart" },
    { name: "Neurology", iconName: "brain" },
    { name: "Pediatrics", iconName: "baby" },
    { name: "Orthopedics", iconName: "bone" },
    { name: "Dermatology", iconName: "sparkles" },
    { name: "Ophthalmology", iconName: "eye" },
    { name: "Psychiatry", iconName: "smile" },
    { name: "Radiology", iconName: "scan" },
    { name: "Oncology", iconName: "ribbon" },
    { name: "General Medicine", iconName: "stethoscope" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }

  // 2. App Settings & Working Days
  await prisma.appSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { slotsPerHour: 2, startTime: "09:00", endTime: "18:00" },
  });

  for (let i = 0; i < 7; i++) {
    await prisma.workingDay.upsert({
      where: { dayOfWeek: i },
      update: {},
      create: { dayOfWeek: i, isWorkingDay: i !== 0 },
    });
  }

  // 3. Create 10 Doctors (Users + DoctorProfiles)
  const doctors = [];
  for (let i = 1; i <= 10; i++) {
    const doc = await prisma.user.upsert({
      where: { email: `doctor${i}@clinic.com` },
      update: {},
      create: {
        name: `Dr. Specialist ${i}`,
        email: `doctor${i}@clinic.com`,
        role: UserRole.DOCTOR,
        phoneNumber: `555-010${i}`,
        doctorProfile: {
          create: {
            specialty: departments[i - 1].name,
            brief: `Expert in ${departments[i - 1].name} with years of experience.`,
            credentials: "MD, Board Certified",
            languages: ["English", "French"],
            specializations: [departments[i - 1].name, "Consultation"],
          },
        },
      },
    });
    doctors.push(doc);
  }

  // 4. Create 10 Patients
  const patients = [];
  for (let i = 1; i <= 10; i++) {
    const pat = await prisma.user.upsert({
      where: { email: `patient${i}@example.com` },
      update: {},
      create: {
        name: `Patient John Doe ${i}`,
        email: `patient${i}@example.com`,
        role: UserRole.PATIENT,
        address: `${i}0${i} Healthcare Ave, City`,
      },
    });
    patients.push(pat);
  }

  // 5. Create 10 Leaves (One for each doctor)
  for (let i = 0; i < 10; i++) {
    await prisma.doctorLeave.upsert({
      where: {
        doctorId_leaveDate: {
          doctorId: doctors[i].id,
          leaveDate: new Date("2024-12-25"),
        },
      },
      update: {},
      create: {
        doctorId: doctors[i].id,
        leaveDate: new Date("2024-12-25"),
        leaveType: LeaveType.FULL_DAY,
        reason: "Holiday Break",
      },
    });
  }

  // 6. Create 10 Appointments & Transactions
  for (let i = 0; i < 10; i++) {
    const appointment = await prisma.appointment.create({
      data: {
        doctorId: doctors[i].id,
        userId: patients[i].id,
        patientType: PatientType.MYSELF,
        patientName: patients[i].name,
        appointmentStartUTC: new Date(2024, 10, i + 1, 10, 0),
        appointmentEndUTC: new Date(2024, 10, i + 1, 10, 30),
        status: AppointmentStatus.BOOKING_CONFIRMED,
        reasonForVisit: "Routine Checkup",
        // Create a related transaction
        transactions: {
          create: {
            doctorId: doctors[i].id,
            paymentGateway: "Stripe",
            gatewayTransactionId: `txn_demo_${i}`,
            amount: 150.0,
            currency: "USD",
            status: TransactionStatus.COMPLETED,
          },
        },
        // Create a related testimonial
        testimonial: {
          create: {
            doctorId: doctors[i].id,
            patientId: patients[i].id,
            testimonialText: "Great experience, very professional!",
            rating: 5,
          },
        },
      },
    });
  }

  // 7. Banner Images
  for (let i = 1; i <= 10; i++) {
    await prisma.bannerImage.create({
      data: {
        name: `Promo Banner ${i}`,
        imageUrl: `https://picsum.photos/seed/${i}/1200/400`,
        fileKey: `key_${i}`,
        order: i,
      },
    });
  }

  console.log("✅ Successfully seeded all tables with 10+ records!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
