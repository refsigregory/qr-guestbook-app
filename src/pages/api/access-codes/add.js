import { PrismaClient } from '@prisma/client';
import { generateUniqueAccessCode } from '@/utils/accessCodeGenerator';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { guestId, code } = req.body;

    const newAccessCode = await prisma.accessCode.create({
      data: {
        guestId,
        code: code || generateUniqueAccessCode(),
      },
    });

    return res.status(201).json(newAccessCode);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
