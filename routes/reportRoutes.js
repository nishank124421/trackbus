 const prisma = require('../prisma/prismaClient');
const upload = require('../../config/multerConfig');
const uploadToCloudinary = require('../utils/uploadToCloud');
const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');



const logReportRequest = (req, res, next) => {
    const time = new Date().toLocaleTimeString();
    console.log(`📋 [${time}] Report Request: ${req.method} ${req.url}`);
    next();
};

const validateReport = (req, res, next) => {
    const { reportType, busNumber, location, date, time, description, severity } = req.body;

    if (!reportType || !busNumber || !location || !date || !time || !description || !severity) {

        return res.status(400).json({
            success: false,
            message: 'All fields are required: reportType, busNumber, location, date, time, description, severity'
        });
    }

    const busPattern = /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/;
    if (!busPattern.test(busNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid bus number format. Use format: PB-01-B-2946'
        });
    }

    next();
};

const JWT_SECRET = process.env.JWT_SECRET || 'trackbus_jwt_secret_2025';

const verifyJWT = (req, res, next) => {
    const token = req.cookies.jwtToken || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Please log in first.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};


const checkSession = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        // User is logged in via session, attach their info
        req.sessionUser = req.session.user;
        next();
    } else {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please log in again.'
        });
    }
};
router.get('/', logReportRequest, async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
    orderBy: {
        createdAt: 'desc'
    }
});
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching reports' });
    }
});

router.post('/', logReportRequest, checkSession, upload.single('evidence'), validateReport, async (req, res) => {

    try {
        const { reportType, busNumber, location, date, time, description, severity, rating } = req.body;
       let evidenceUrl = null;
       if (req.file) {
    try {
        evidenceUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        console.log('📸 Evidence uploaded to Cloudinary:', evidenceUrl);
    } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr.message);
        // Don't crash — report can still be saved without evidence
    }
}
        const savedReport = await prisma.report.create({
    data: {
        reportType,
        busNumber,
        location,
        date,
        time,
        description,
        severity,
        rating: rating || 'Not rated',
        submittedBy: req.sessionUser?.name || 'Anonymous',
        userId: req.sessionUser?.userId || null,
        evidenceUrl: evidenceUrl
    }
});
       
        res.status(201).json({
            success: true,
            message: 'Report submitted successfully!',
            report: savedReport
        });

    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ success: false, message: 'Failed to save report' });
    }
});


router.get('/critical', async (req, res) => {
    try {
        const criticalReports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ 
            success: true, 
            source: 'PostgreSQL', 
            count: criticalReports.length,
            reports: criticalReports 
        });
    } catch (error) {
        console.error('PostgreSQL read error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch from PostgreSQL' });
    }
});

// NEW ROUTE: Delete a critical report from PostgreSQL
router.delete('/critical/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.report.delete({
            where: { id: id }
        });
        res.json({ success: true, message: 'Deleted from PostgreSQL' });
    } catch (error) {
        console.error('PostgreSQL delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete from PostgreSQL' });
    }
});

router.get('/view', async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
    orderBy: {
        createdAt: 'desc'
    }
});
        res.render('reports-view', { reports });
    } catch (error) {
        res.status(500).send('Error loading reports page');
    }
});

module.exports = router;
