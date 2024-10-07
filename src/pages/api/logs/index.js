import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const logs = await prisma.logs.findMany({
        orderBy: { createdAt: 'desc' }, // Order logs by creation time
        include: { guest: true }, // Include related guest info if needed
      });
      res.status(200).json({
        message: "Get logs data successfully",
        data: logs,
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
