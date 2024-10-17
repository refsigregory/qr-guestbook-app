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
          message: 'Maaf, QR Code ini tidak terdaftar.',
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

      let lastStatus = "";
      if (lastLog) {
        lastStatus = lastLog?.status;
      }

      const guestData = foundCode.guest;

      let message = 'Berhasil menyimpan data';
      const guestName = guestData?.name || 'Tamu';
      const guestCheckInMessage = (guestData.name && guestData?.name) ? `atas nama ${guestData?.name} (${guestData?.description})` : '';

      if (status === "CheckIn" && lastStatus === "CheckIn") {
        // Already CheckIn
        return res.status(403).json({
          message: `Maaf, ${guestName} sudah CheckIn sebelumnya.`,
         });
      } else if (status === "CheckOut" && lastStatus=== "CheckIn") {
        // Success CheckOut
        message = `${guestName} berhasil CheckOut`;
      } else if (status === "CheckOut" && lastStatus === "CheckOut") {
        // Already CheckOut
        return res.status(403).json({
          message: `${guestName} sudah ChekOut sebelumnya.`,
         });
      } else if (status === "CheckIn") {
        // Success CheckIn
        message = `Berhasil CheckIn ${guestCheckInMessage}`;
      } else {
        return res.status(400).json({
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
          guest: guestData
        },

        guest: guestData, // temporary add untill mobile app update
      });
    } catch (error) {
      console.error('Error fetching access code:', error);
      return res.status(500).json({ message: 'Gagal untuk memproses' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
