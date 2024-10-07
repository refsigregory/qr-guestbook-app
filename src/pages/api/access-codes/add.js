import { prisma } from '@/lib/prisma';
import { generateUniqueAccessCode } from '@/utils/accessCodeGenerator'; 

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { guestId, code: accessCode } = req.body;

    const newAccessCode = await prisma.accessCode.create({
      data: {
        guestId,
        code: accessCode || generateUniqueAccessCode(),
      },
    });

    return res.status(201).json({
        message: "Success adding new single acces code",
        data: newAccessCode,
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
