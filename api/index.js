const axios = require('axios');

// This is a standard Vercel Serverless Function. No Express app needed.
module.exports = async (req, res) => {
    // Get the keyword from the query parameters (e.g., /api/index?keyword=react)
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }

    if (!process.env.X_BEARER_TOKEN) {
        return res.status(500).json({ error: 'Server environment variable X_BEARER_TOKEN not set.' });
    }

    const twitterURL = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(keyword)} lang:en -is:retweet&tweet.fields=created_at&expansions=author_id&max_results=10`;

    try {
        const response = await axios.get(twitterURL, {
            headers: {
                'Authorization': `Bearer ${process.env.X_BEARER_TOKEN}`
            }
        });

        if (response.data.meta.result_count === 0) {
            return res.status(200).json([]);
        }

        const tweets = response.data.data;
        const users = response.data.includes.users;
        const userMap = new Map(users.map(user => [user.id, user.username]));
        
        const formattedTweets = tweets.map(tweet => ({
            id: tweet.id,
            text: tweet.text,
            user: userMap.get(tweet.author_id) || 'Unknown'
        }));
        
        // Vercel handles CORS and headers for you in most cases
        res.status(200).json(formattedTweets);

    } catch (error) {
        console.error('Error fetching posts from X API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch posts from X API', details: error.response ? error.response.data : {} });
    }
};
