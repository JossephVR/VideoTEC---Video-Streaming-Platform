// Creates a video card for displaying search results
function createSearchResult(video) {
    return `
        <div class="bg-white rounded-lg shadow-sm p-3 flex search-result-card">
            <a href="video-player.html?id=${video.id}" class="flex flex-grow">
                <img src="${API_URL}/static/${video.thumbnail_path || 'thumbnails/default_thumb.jpg'}" alt="${video.title}" class="w-32 h-24 object-cover rounded-lg mr-3 sm:w-40 sm:h-24">
                <div class="flex-1 min-w-0">
                    <h2 class="text-base font-semibold mb-1 line-clamp-2">${video.title}</h2>
                    <div class="flex items-center text-xs text-gray-500 mb-1">
                        <span class="mr-2">${video.views_count} visualizaciones</span>
                        <span>•</span>
                        <span class="ml-2">${new Date(video.creation_date).toLocaleDateString()}</span>
                    </div>
                    <p class="text-xs text-gray-600 line-clamp-2 sm:line-clamp-3">${video.description || 'Sin descripción'}</p>
                </div>
            </a>
        </div>
    `;
}

// Performs the search request and returns results
async function performSearch(query) {
    try {
        const response = await fetch(`${API_URL}/search/?query=${encodeURIComponent(query)}`);
        const videos = await response.json();
        return videos;
    } catch (error) {
        console.error('Error performing search:', error);
        return [];
    }
}

// Handles search term input and display of results on page load
document.addEventListener('DOMContentLoaded', async function() {
    const searchTerm = new URLSearchParams(window.location.search).get('q');
    const searchTermElement = document.getElementById('search-term');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results');

    if (searchTermElement) {
        searchTermElement.textContent = searchTerm;
    }
    if (searchInput) {
        searchInput.value = searchTerm;
    }

    if (searchTerm && searchResultsContainer) {
        const searchResults = await performSearch(searchTerm);
        if (searchResults.length > 0) {
            searchResults.forEach(video => {
                searchResultsContainer.innerHTML += createSearchResult(video);
            });
        } else {
            searchResultsContainer.innerHTML = '<p class="text-center text-gray-500">No se encontraron resultados para tu búsqueda.</p>';
        }
    }
});
