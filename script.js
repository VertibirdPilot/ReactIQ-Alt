// --- DOM Element References ---
const loadingSpinner = document.getElementById('loading');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultContainer = document.getElementById('result-container');
const postsContainer = document.getElementById('posts-container');
const noResultMessage = document.getElementById('no-result-message');

// --- UI Logic ---
const showLoading = (show) => {
    loadingSpinner.classList.toggle('hidden', !show);
};

const displayPosts = (posts) => {
    postsContainer.innerHTML = '';
    resultContainer.classList.remove('hidden');
    noResultMessage.classList.add('hidden');

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'bg-slate-800/80 p-6 rounded-xl border border-slate-700 animate-fade-in';
        
        postCard.innerHTML = `
            <p class="text-gray-300 leading-relaxed">${post.text}</p>
            <div class="text-right text-sm text-sky-400 font-semibold mt-4">
                <span>@${post.user}</span>
            </div>
        `;
        
        postsContainer.appendChild(postCard);
    });
};

const showNoResults = () => {
    postsContainer.innerHTML = ''; // Clear container
    resultContainer.classList.remove('hidden');
    noResultMessage.classList.remove('hidden');
    noResultMessage.textContent = "No posts found for that keyword. Try another search.";
};

// --- Post Fetching (from your backend) ---
async function fetchPostsFromBackend(keyword) {
    showLoading(true);
    try {
        const response = await fetch(`/api/search-tweets?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch posts. Is your local server running?", error);
        alert("Could not fetch posts. Make sure your local server is running and check the console for errors.");
        return [];
    } finally {
        showLoading(false);
    }
}

// --- Event Listeners ---
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const keyword = searchInput.value.trim();
    if (!keyword) return;

    const posts = await fetchPostsFromBackend(keyword);
    
    if (posts && posts.length > 0) {
        displayPosts(posts);
    } else {
        showNoResults();
    }
    // We don't clear the input in this design
});
