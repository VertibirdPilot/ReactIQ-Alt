const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3001;


app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});


app.use(express.static(__dirname));


app.get('/api/search-tweets', async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }

    if (!process.env.X_BEARER_TOKEN) {
        return res.status(500).json({ error: 'X_BEARER_TOKEN is not set in .env file' });
    }

    const twitterURL = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(keyword)} lang:en -is:retweet&tweet.fields=created_at&expansions=author_id&max_results=10`;

    try {
        console.log(`Fetching posts for keyword: ${keyword}`);
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Make sure your .env file is created and contains your X_BEARER_TOKEN.');
    console.log('Open http://localhost:3001 in your browser to use the app.');
});