import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { accessCode } = req.body;

    try {
      // Check if the access code exists and is valid
      const foundCode = await prisma.accessCode.findFirst({
        where: {
          code: accessCode,
          expiredAt: null, // Assuming you want to check for non-expired codes
        },
        include: {
          guest: true, // Include guest information
        },
      });

      if (!foundCode) {
        return res.status(404).json({
          error: 'Maaf, QR Code anda tidak terdaftar.', // depercated, need to remove after update mobile app
          message: 'Maaf, QR Code anda tidak terdaftar.',
         });
      }

      // Log the access (you may want to adjust this part)
      const log = await prisma.logs.create({
        data: {
          guestId: foundCode.guestId,
          accessCode: foundCode.code,
        },
      });

      return res.status(201).json({
        message: 'Add logs succesfully',
        data: {
          log,
          guest: foundCode.guest
        },

        log, // depercated, need to remove after update mobile app
        guest: foundCode.guest // depercated, need to remove after update mobile app
      });
    } catch (error) {
      console.error('Error fetching access code:', error);
      return res.status(500).json({ message: 'Failed to log access' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
