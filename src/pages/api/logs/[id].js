import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === 'DELETE') {
      // Delete the guest
      await prisma.logs.delete({
        where: { id: parseInt(id) },
      });

      return res.status(204).end();
    } else {
      // Method not allowed
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    if (error.code === 'P2025') {
      // Record not found
      return res.status(404).json({
        message: 'Logs not found'
      });
    }
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
