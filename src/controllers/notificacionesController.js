async function getNotifications(req, res) {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ error: 'DB connection error' });
        }
        const sql = 'CALL SHOW_NOTIFICATIONS()';
        conn.query(sql, (err, result) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'DB query error [TIMEOUT]' });
            }
            const notifications = result?.[0] || [];
            //console.log(notifications);
            return res.json(notifications);
        });
    });
}

export const methods = {
    getNotifications
};