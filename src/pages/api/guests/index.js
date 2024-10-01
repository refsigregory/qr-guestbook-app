import { PrismaClient } from '@prisma/client';
import { generateUniqueAccessCode } from '@/utils/accessCodeGenerator'; // Ensure this function exists

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const guests = await prisma.guest.findMany({
        include: { accessCodes: true }, // Include access codes
      });
      res.status(200).json(guests);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch guests' });
    }
  } else if (req.method === 'POST') {
    const { name, description } = req.body;

    try {
      // Create the new guest
      const newGuest = await prisma.guest.create({
        data: {
          name,
          description,
        },
      });

      // Generate and create 3 unique access codes
      const accessCodes = [];
      for (let i = 0; i < 3; i++) {
        const code = generateUniqueAccessCode();
        accessCodes.push({
          guestId: newGuest.id,
          code,
        });
      }

      await prisma.accessCode.createMany({
        data: accessCodes,
      });

      res.status(201).json(newGuest);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create guest and access codes' });
    }
  } else if (req.method === 'PUT') {
    const { guestId, code } = req.body;

    try {
      const newAccessCode = await prisma.accessCode.create({
        data: {
          guestId,
          code,
        },
      });

      res.status(201).json(newAccessCode);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create access code' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
