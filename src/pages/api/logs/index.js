import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch logs and include related guest info
      const logs = await prisma.logs.findMany({
        orderBy: { createdAt: 'desc' },
        include: { guest: true },
      });

      // Map through logs to fetch codeNumber for each log
      const logsWithCodeNumbers = await Promise.all(logs.map(async (log) => {
        // Fetch access codes for the associated guest
        const dataAccessCode = await prisma.accessCode.findMany({
          where: { guestId: parseInt(log.guestId) }, // Assuming logs have guestId
        });

        // Find the codeNumber based on the log's code
        let codeNumber = null;
        let rank = 1; 
        dataAccessCode.forEach((obj) => {
          if (obj.code === log.accessCode) { // Assuming logs have a code field
            codeNumber = rank;
          }
          rank++;
        });

        return {
          ...log,
          codeNumber,
        };
      }));

      res.status(200).json({
        message: "Get logs data successfully",
        data: logsWithCodeNumbers,
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ message: 'Failed to fetch logs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
