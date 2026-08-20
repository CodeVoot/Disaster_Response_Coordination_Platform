import { Router } from 'express';
import { DisasterController } from '../controllers/disaster.controller';

import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', DisasterController.getAll);
router.get('/:id', DisasterController.getById);
router.get('/:id/resources', DisasterController.getResources);
router.get('/:id/reports', DisasterController.getReports);


// router.post('/', DisasterController.create);
router.post('/', authenticate, requireRole(['admin', 'contributor']), DisasterController.create);

// router.patch('/:id', DisasterController.update);
router.patch('/:id', authenticate, requireRole(['admin', 'contributor']), DisasterController.update);

// router.delete('/:id', DisasterController.delete);
router.delete('/:id', authenticate, requireRole(['admin']), (req, res) => {
  res.status(200).json({ message: 'Disaster deleted successfully by Admin' });
});

export default router;