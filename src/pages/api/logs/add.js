import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { accessCode, status } = req.body;

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

      if (!status) {
        return res.status(400).json({
          error: 'Maaf, anda harus memilih menu CheckIn atau CheckOut', // depercated, need to remove after update mobile app
          message: 'Maaf, anda harus memilih menu CheckIn atau CheckOut.',
         });
      }

      const lastLog = await prisma.logs.findFirst({
        where: {
          guestId: foundCode.guestId,
          accessCode: foundCode.code,
        },
        orderBy: {
          createdAt: 'desc', // Order by createdAt in descending order
        },
      });

      let lastStatus = "CheckIn";
      if (lastLog) {
        lastStatus = lastLog?.status;
      }

      let message = 'Add logs succesfully';
      if (status === "CheckIn" && lastStatus === "CheckIn") {
        // Already CheckIn
        return res.status(403).json({
          message: 'Maaf, anda sudah CheckIn sebelumnya.',
          data: {
            log,
            guest: foundCode.guest
          },
         });
      } else if (status === "CheckOut" && lastStatus=== "CheckIn") {
        // Success CheckOut
        message = 'Anda berhasil CheckOut';
      } else if (status === "CheckOut" && lastStatus === "CheckOut") {
        // Already CheckOut
        return res.status(403).json({
          message: 'Anda sudah ChekOut sebelumnya.',
          data: {
            log,
            guest: foundCode.guest
          },
         });
      } else if (status === "CheckIn") {
        // Success CheckIn
        message = 'Anda berhasil CheckIn';
      } else {
        return res.status(400).json({
          error: 'Maaf, permintaan anda tidak valid', // depercated, need to remove after update mobile app
          message: 'Maaf, permintaan anda tidak valid',
         });
      }

      // Log the access (you may want to adjust this part)
      const log = await prisma.logs.create({
        data: {
          guestId: foundCode.guestId,
          accessCode: foundCode.code,
          status,
        },
      });

      return res.status(201).json({
        message: message,
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
