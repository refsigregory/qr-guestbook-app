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

      return res.status(200).json({
        message: "Update guest succesfully",
        data: updatedGuest,
      });
    } else if (req.method === 'DELETE') {
        
      // Delete related logs first
      await prisma.logs.deleteMany({
        where: { guestId: parseInt(id) },
      });
        
      // Delete related access codes
      await prisma.accessCode.deleteMany({
        where: { guestId: parseInt(id) },
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
      return res.status(404).json({
        message: 'Guest not found'
      });
    }
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
