const express = require('express');
const router = express.Router();


/**
 * @swagger
 * /docs/resources/resource/{id}:
 *   put:
 *     summary: Updates data for a specific resource materials
 *     description: UPDATE RESOURCE By ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: REESOURCE ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: UPDATES RESOURCE MATERIAL by ID
 */
 router.put("/resources/resource/:id", (req, res) => {
    const resourceId = req.params.id;
    const { title, course_id, description, content, img } = req.body;
    const userId = req.session.user.user_id;
    const userRole = req.session.user.role;

    if (userRole === 'contributor' || userRole === 'admin') {
        const updateResourceQuery = `
            UPDATE resource 
            SET resource_title = ?, resource_course_id = ?, resource_description = ?, 
                resource_content = ?, resource_img = ?
            WHERE resource_id = ?`;

        db.query(
            updateResourceQuery,
            [title, course_id, description, content, img, resourceId],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Error updating resource information" });
                }

                return res.status(200).json({
                    message: "Resource material updated successfully",
                    nextStep: "redirect to resources"
                });
            }
        );
    } else {
        res.status(403).json({ message: 'Unauthorized access' });
    }
});

/**
 * @swagger
 * /docs/resources/approve-resource/{id}:
 *   put:
 *     summary: Approve a resource material
 *     description: Approve Resource Material (Admin Only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: RESOURCE ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource material approved successfully
 */
 router.put('/resources/approve-resource/:id', (req, res) => {
    const db = req.db;
    const userRole = req.session.user.role;
    if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    const resourceId = req.params.id;
    const updateStatusQuery = `
        UPDATE resource
        SET status = 'approved'
        WHERE resource_id = ?
    `;

    db.query(updateStatusQuery, [resourceId], (err, result) => {
        if (err) {
            console.error("Error updating resource status in the database", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Resource not found" });
        }

        return res.status(200).json({
            message: "Resource material approved successfully",
            nextStep: "redirect to approved resources"
        });
    });
});

module.exports = router;



module.exports = router