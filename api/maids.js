export default async function handler(req, res) {
    // Enable CORS for frontend clients
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const KV_URL = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;

    if (!KV_URL || !KV_TOKEN) {
        return res.status(500).json({ 
            error: "Database not connected. Please click 'Storage' -> 'Connect KV' in your Vercel Dashboard!" 
        });
    }

    try {
        if (req.method === 'GET') {
            const response = await fetch(`${KV_URL}/get/maids`, {
                headers: { Authorization: `Bearer ${KV_TOKEN}` }
            });
            const data = await response.json();
            const maids = JSON.parse(data.result || '[]');
            return res.status(200).json(maids);
        }

        if (req.method === 'POST') {
            const newMaid = req.body;
            
            // Fetch current maids
            const getResponse = await fetch(`${KV_URL}/get/maids`, {
                headers: { Authorization: `Bearer ${KV_TOKEN}` }
            });
            const getData = await getResponse.json();
            const maids = JSON.parse(getData.result || '[]');

            // Append new maid details
            maids.push(newMaid);

            // Write back to Vercel KV
            await fetch(`${KV_URL}/set/maids`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${KV_TOKEN}` },
                body: JSON.stringify(maids)
            });
            
            return res.status(200).json({ success: true, maid: newMaid });
        }

        if (req.method === 'PUT') {
            const updatedMaids = req.body;

            // Write back to Vercel KV
            await fetch(`${KV_URL}/set/maids`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${KV_TOKEN}` },
                body: JSON.stringify(updatedMaids)
            });
            
            return res.status(200).json({ success: true, maids: updatedMaids });
        }
    } catch (error) {
        return res.status(500).json({ error: error.toString() });
    }
}
