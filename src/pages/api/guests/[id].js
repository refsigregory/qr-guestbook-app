import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const { name, description } = req.body;

      // Update the guest
      const updatedGuest = await prisma.guest.update({
        where: { id: parseInt(id) },
        data: { name, description },
      });

      return res.status(200).json(updatedGuest);
    } else if (req.method === 'DELETE') {
        
      const accessCode = await prisma.accessCode.findMany({
        where: { guestId: parseInt(id) },
      });
      
      accessCode?.map(async (obj) => {
          await prisma.accessCode.delete({
        where: { id: parseInt(obj.id) }
      })
      });
      
      // Delete the guest
      await prisma.guest.delete({
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
      return res.status(404).json({ error: 'Guest not found' });
    }
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
