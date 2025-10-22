import { Router } from 'express';

const router = Router();

router.use((req, res) => {
    console.log('Not found:', req.method, req.originalUrl);
    res.status(400).send({
        message: 'Route not found',
    });
});

export default router;