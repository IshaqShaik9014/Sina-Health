import prisma from '../config/prisma';

export async function generatePatientSinaId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `SINA-PAT-${currentYear}-`;

  // Count existing patients registered this year
  const count = await prisma.patient.count({
    where: {
      sinaId: {
        startsWith: prefix,
      },
    },
  });

  const sequentialNumber = (count + 1).toString().padStart(6, '0');
  return `${prefix}${sequentialNumber}`;
}

export function generateAccessRequestId(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `SINA-REQ-${currentYear}-${randomSuffix}`;
}
