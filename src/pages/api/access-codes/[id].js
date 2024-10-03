import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    await prisma.accessCode.delete({
      where: { id: parseInt(id) },
    });
    return res.status(204).end();
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
