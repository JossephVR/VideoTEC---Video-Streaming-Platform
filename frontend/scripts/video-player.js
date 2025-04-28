// Fetch video details from the server by videoId
async function fetchVideoDetails(videoId) {
    try {
        // Send a GET request to retrieve video details
        const response = await fetch(`${API_URL}/videos/${videoId}`);
        return await response.json(); // Return video details as JSON
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null; // Return null in case of an error
    }
}

// Fetch comments for a specific video from the server
async function fetchVideoComments(videoId) {
    try {
        // Send a GET request to retrieve video comments
        const response = await fetch(`${API_URL}/videos/${videoId}/comments/`);
        return await response.json(); // Return comments as JSON
    } catch (error) {
        console.error('Error fetching video comments:', error);
        return []; // Return an empty array in case of an error
    }
}

// Post a comment for a specific video
async function postComment(videoId, comment) {
    try {
        // Send a POST request with the comment data
        const response = await fetch(`${API_URL}/videos/${videoId}/comments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Set request content type as JSON
            },
            body: JSON.stringify({ comment }), // Send the comment in the request body
        });
        return await response.json(); // Return the posted comment as JSON
    } catch (error) {
        console.error('Error posting comment:', error);
        return null; // Return null in case of an error
    }
}

// Toggle favorite status for a video (add/remove from favorites)
async function toggleFavorite(videoId, isFavorite) {
    try {
        if (isFavorite) {
            // Remove from favorites if the video is currently a favorite
            await fetch(`${API_URL}/favorites/${videoId}`, { method: 'DELETE' });
        } else {
            // Add to favorites if the video is not currently a favorite
            await fetch(`${API_URL}/favorites/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ video_id: videoId }), // Send the video ID in the request body
            });
        }
        return !isFavorite; // Return the new favorite status
    } catch (error) {
        console.error('Error toggling favorite:', error);
        return isFavorite; // Return the current status if an error occurs
    }
}

// Create a comment element in HTML
function createCommentElement(comment) {
    return `
        <div class="flex items-start mb-4">
            <div>
                <p class="font-semibold text-sm">${comment.user || 'Usuario anónimo'} <span class="font-normal text-gray-500 text-xs">${new Date(comment.creation_date).toLocaleString()}</span></p>
                <p class="text-sm">${comment.comment}</p>
            </div>
        </div>
    `;
}

// When the page content is loaded, fetch and display video and comment data
document.addEventListener('DOMContentLoaded', async function() {
    const videoId = new URLSearchParams(window.location.search).get('id'); // Get video ID from URL query parameter
    if (!videoId) {
        console.error('No video ID provided'); // If no video ID is found, log an error
        return;
    }

    // Fetch video details
    const video = await fetchVideoDetails(videoId);
    if (!video) {
        console.error('Failed to fetch video details'); // If video details cannot be fetched, log an error
        return;
    }

    // Update video player and metadata with the fetched details
    const videoPlayer = document.getElementById('main-video');
    const videoSource = document.getElementById('video-source');
    const videoTitle = document.getElementById('video-title');
    const videoViews = document.getElementById('video-views');
    const videoDate = document.getElementById('video-date');
    const videoDescription = document.getElementById('video-description');
    const favoriteButton = document.getElementById('favorite-button');

    if (videoSource) videoSource.src = `${API_URL}/static/${video.video_path}`; // Set the video source
    if (videoPlayer) videoPlayer.load(); // Reload the video player to load the new video
    if (videoTitle) videoTitle.textContent = video.title; // Set the video title
    if (videoViews) videoViews.textContent = `${video.views_count} vistas`; // Set the view count
    if (videoDate) videoDate.textContent = new Date(video.creation_date).toLocaleDateString(); // Set the video creation date
    if (videoDescription) videoDescription.textContent = video.description || 'Sin descripción'; // Set video description

    // Handle favorite button click
    if (favoriteButton) {
        favoriteButton.addEventListener('click', async () => {
            favoriteButton.disabled = true; // Disable the button while processing the request

            // Toggle favorite status of the video
            const newFavoriteStatus = await toggleFavorite(videoId, video.is_favorite);

            // Update the favorite button text with the new status
            favoriteButton.innerHTML = newFavoriteStatus ? '<i class="fas fa-star"></i> Favorito' : '<i class="far fa-star"></i> Favorito';

            favoriteButton.disabled = false; // Enable the button after the request
        });
    }

    // Fetch and display comments for the video
    const comments = await fetchVideoComments(videoId);
    const commentsList = document.getElementById('comments-list');
    if (commentsList) {
        comments.forEach(comment => {
            commentsList.innerHTML += createCommentElement(comment); // Add each comment to the comments list
        });
    }

    // Handle posting of new comments
    const commentInput = document.getElementById('comment-input');
    const postCommentButton = document.getElementById('post-comment');
    if (commentInput && postCommentButton) {
        postCommentButton.addEventListener('click', async () => {
            const commentText = commentInput.value.trim(); // Get the comment text and trim any extra spaces
            if (commentText) {
                // Post the new comment
                const newComment = await postComment(videoId, commentText);
                if (newComment) {
                    // Add the new comment to the top of the comments list
                    commentsList.innerHTML = createCommentElement(newComment) + commentsList.innerHTML;
                    commentInput.value = ''; // Clear the comment input field
                }
            }
        });
    }
});
