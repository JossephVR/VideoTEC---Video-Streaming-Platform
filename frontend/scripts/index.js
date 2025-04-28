// Creates a video card element to display a video's thumbnail, title, and views
function createVideoCard(video) {
    // Set the thumbnail image path or use a default if none exists
    const thumbnailPath = video.thumbnail_path
        ? `${API_URL}/static/${video.thumbnail_path}`
        : `${API_URL}/static/thumbnails/default_thumb.jpg`;

    return `
        <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300">
            <a href="video-player.html?id=${video.id}">
                <img src="${thumbnailPath}" alt="${video.title}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="font-medium text-sm mb-1 line-clamp-2">${video.title}</h3>
                    <p class="text-gray-600 text-xs">${video.views_count} vistas • ${new Date(video.creation_date).toLocaleDateString()}</p>
                </div>
            </a>
        </div>
    `;
}

// Fetches the most viewed videos from the API
async function fetchMostViewedVideos() {
    try {
        const response = await fetch(`${API_URL}/most-viewed/`);
        const videos = await response.json();
        return videos;
    } catch (error) {
        console.error('Error fetching most viewed videos:', error);
        return [];
    }
}

// Fetches the favorite videos from the API
async function fetchFavoriteVideos() {
    try {
        const response = await fetch(`${API_URL}/favorites/`);
        const favorites = await response.json();
        return favorites;
    } catch (error) {
        console.error('Error fetching favorite videos:', error);
        return [];
    }
}

// Displays a message when no videos are found in the container
function displayNoVideosMessage(container, message) {
    container.innerHTML = `<p class="text-gray-500 text-center col-span-full">${message}</p>`;
}

// Main function to run when the page is loaded
document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const showFavoritesOnly = params.get('favorites') === 'true';

    // Get the container elements for most viewed and favorite videos
    const mostViewedVideosContainer = document.getElementById('most-viewed-videos');
    const favoriteVideosContainer = document.getElementById('favorite-videos');
    const mostViewedSection = document.getElementById('most-viewed-section');
    const favoriteSection = document.getElementById('favorite-section');

    // If 'favorites' param is true, display only favorite videos
    if (showFavoritesOnly) {
        if (mostViewedSection) mostViewedSection.style.display = 'none';
        if (favoriteSection) favoriteSection.style.display = 'block';

        const favoriteVideos = await fetchFavoriteVideos();
        if (favoriteVideosContainer) {
            if (favoriteVideos.length > 0) {
                favoriteVideos.forEach(favorite => {
                    favoriteVideosContainer.innerHTML += createVideoCard(favorite.video);
                });
            } else {
                displayNoVideosMessage(favoriteVideosContainer, "No tienes videos favoritos aún.");
            }
        }
    } else {
        // Show both most viewed and favorite video sections
        if (mostViewedSection) mostViewedSection.style.display = 'block';
        if (favoriteSection) favoriteSection.style.display = 'block';

        const mostViewedVideos = await fetchMostViewedVideos();
        if (mostViewedVideosContainer) {
            if (mostViewedVideos.length > 0) {
                mostViewedVideos.forEach(video => {
                    mostViewedVideosContainer.innerHTML += createVideoCard(video);
                });
            } else {
                displayNoVideosMessage(mostViewedVideosContainer, "No hay videos subidos aún.");
            }
        }

        const favoriteVideos = await fetchFavoriteVideos();
        if (favoriteVideosContainer) {
            if (favoriteVideos.length > 0) {
                favoriteVideos.forEach(favorite => {
                    favoriteVideosContainer.innerHTML += createVideoCard(favorite.video);
                });
            } else {
                displayNoVideosMessage(favoriteVideosContainer, "No tienes videos favoritos aún.");
            }
        }
    }
});
