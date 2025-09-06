
const loadingSpinner = document.getElementById('loading');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultContainer = document.getElementById('result-container');
const postsContainer = document.getElementById('posts-container');
const noResultMessage = document.getElementById('no-result-message');
const initialMessage = document.getElementById('initial-message');


const showLoading = (show) => {
    loadingSpinner.classList.toggle('hidden', !show);
};


const displayPosts = (posts) => {

    postsContainer.innerHTML = '';

    resultContainer.classList.remove('hidden');
    noResultMessage.classList.add('hidden');
    initialMessage.classList.add('hidden');


    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'p-6 border rounded-lg bg-gray-50 animate-fade-in';
        
        postCard.innerHTML = `
            <p class="text-gray-800 text-lg leading-relaxed">${post.text}</p>
            <div class="text-right text-md text-blue-600 font-semibold mt-4">
                <span>@${post.user}</span>
            </div>
        `;
        
        postsContainer.appendChild(postCard);
    });
};

const showNoResults = () => {
    postsContainer.innerHTML = ''; 
    resultContainer.classList.remove('hidden');
    noResultMessage.classList.remove('hidden');
    initialMessage.classList.add('hidden');
    noResultMessage.textContent = "No posts found for that keyword. Try another search.";
};



async function fetchPostsFromBackend(keyword) {
    showLoading(true);

    try {
        const response = await fetch(`/api/search-tweets?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Could not fetch posts.", error);
        alert("Could not fetch posts.");
        return []; 
    } finally {
        showLoading(false);
    }
}


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
    searchInput.value = '';
});

