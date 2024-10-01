import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { guestId, code } = req.body;

    const newAccessCode = await prisma.accessCode.create({
      data: {
        guestId,
        code,
      },
    });

    return res.status(201).json(newAccessCode);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
