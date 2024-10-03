import { prisma } from '@/lib/prisma';
import { generateUniqueAccessCode } from '@/utils/accessCodeGenerator'; // Ensure this function exists

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, description } = req.body;

    // Validate the input data
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    try {
      // Create the guest
      const guest = await prisma.guest.create({
        data: {
          name,
          description,
        },
      });

      // Generate and create 3 unique access codes
      const accessCodes = Array.from({ length: 3 }, () => ({
        guestId: guest.id,
        code: generateUniqueAccessCode(),
      }));

      await prisma.accessCode.createMany({
        data: accessCodes,
      });

      return res.status(201).json({
          "message": "Access code created"
      });
    } catch (error) {
      console.error('Error creating guest or access codes:', error); // Log the error for debugging
      return res.status(500).json({ error: 'Failed to create guest and access codes' });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ message: 'Method not allowed' });
}
