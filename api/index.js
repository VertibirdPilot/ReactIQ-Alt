const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// IMPORTANT: No port constant or app.listen() needed for Vercel

// Serve static files for requests that are not for the API
// This points to the public files in the root directory, one level up from /api
app.use(express.static(path.join(__dirname, '..')));

// API endpoint for searching posts
app.get('/api/search-tweets', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }

    // On Vercel, environment variables are set in the project settings
    if (!process.env.X_BEARER_TOKEN) {
        return res.status(500).json({ error: 'Server environment variable not set.' });
    }

    const twitterURL = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(keyword)} lang:en -is:retweet&tweet.fields=created_at&expansions=author_id&max_results=10`;

    try {
        const response = await axios.get(twitterURL, {
            headers: {
                'Authorization': `Bearer ${process.env.X_BEARER_TOKEN}`
            }
        });

        if (response.data.meta.result_count === 0) {
            return res.json([]);
        }

        const tweets = response.data.data;
        const users = response.data.includes.users;
        const userMap = new Map(users.map(user => [user.id, user.username]));
        
        const formattedTweets = tweets.map(tweet => ({
            id: tweet.id,
            text: tweet.text,
            user: userMap.get(tweet.author_id) || 'Unknown'
        }));
        
        res.json(formattedTweets);

    } catch (error) {
        console.error('Error fetching posts from X API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch posts from X API', details: error.response ? error.response.data : {} });
    }
});

// Export the app for Vercel to use
module.exports = app;
