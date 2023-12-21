const express = require('express');
const router = express.Router();




 router.delete('/resources/delete-resource/:id', (req, res) => {
    const db = req.db;
    const userRole = req.session.user.role;
    const userId = req.session.user.user_id;
    const resourceId = req.params.id;
    if (userRole !== 'admin' && userRole !== 'contributor') {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    let deleteQuery;
    if (userRole === 'admin') {
        deleteQuery = 'DELETE FROM resource WHERE resource_id = ? AND status = "approved"';
    } else {
        deleteQuery = 'DELETE FROM resource WHERE resource_id = ? AND user_id = ? AND status = "approved"';
    }

    db.query(deleteQuery, [resourceId, userId], (err, result) => {
        if (err) {
            console.error("Error deleting resource from the database", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Resource not found or unauthorized to delete" });
        }

        return res.status(200).json({
            message: "Resource material deleted successfully",
            nextStep: "redirect to resources"
        });
    });
});

module.exports = router;
