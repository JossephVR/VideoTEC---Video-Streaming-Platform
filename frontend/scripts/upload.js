document.addEventListener('DOMContentLoaded', function() {
    // Select elements related to the upload form and video/thumbnail inputs
    const form = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    const fileInput = document.getElementById('video-file');
    const thumbnailInput = document.getElementById('thumbnail');
    const videoFileInfo = document.getElementById('video-file-info');
    const videoFileName = document.getElementById('video-file-name');
    const changeVideoBtn = document.getElementById('change-video');
    const thumbnailPreviewContainer = document.getElementById('thumbnail-preview-container');
    const thumbnailPreview = document.getElementById('thumbnail-preview');
    const changeThumbnailBtn = document.getElementById('change-thumbnail');
    const thumbnailDropZone = document.getElementById('thumbnail-drop-zone');
    const submitButton = document.querySelector('button[type="submit"]');
    const videoDropZone = document.getElementById('video-drop-zone');

    // Handle form submission when the user uploads a video
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            // Check if a video file is selected
            if (!fileInput.files.length) {
                alert('Por favor, selecciona un video antes de subir.');
                return;
            }

            // Show upload status indicator
            if (uploadStatus) {
                uploadStatus.classList.remove('hidden');
            }

            const formData = new FormData();
            formData.append('video_file', fileInput.files[0]); // Add video file to form data
            formData.append('title', document.getElementById('video-title').value); // Add title
            formData.append('description', document.getElementById('video-description').value); // Add description

            // If a thumbnail is selected, add it to the form data
            if (thumbnailInput.files.length) {
                formData.append('thumbnail_file', thumbnailInput.files[0]);
            }

            try {
                // Send form data to the API for video upload
                const response = await fetch(`${API_URL}/videos/`, {
                    method: 'POST',
                    body: formData
                });

                // Handle successful upload
                if (response.ok) {
                    alert('Video subido con éxito!');
                    window.location.href = 'index.html'; // Redirect to homepage after upload
                } else {
                    // Handle errors from the API
                    const errorData = await response.json();
                    alert(`Error al subir el video: ${errorData.detail}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al subir el video. Por favor, intenta de nuevo.');
            } finally {
                // Hide upload status indicator
                if (uploadStatus) {
                    uploadStatus.classList.add('hidden');
                }
            }
        });
    }

    // Handle changes in video file input
    if (fileInput) {
        fileInput.addEventListener('change', handleVideoFileChange);
    }

    // Handle changes in thumbnail input
    if (thumbnailInput) {
        thumbnailInput.addEventListener('change', handleThumbnailChange);
    }

    // Trigger file input click when change video button is clicked
    if (changeVideoBtn) {
        changeVideoBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // Trigger thumbnail input click when change thumbnail button is clicked
    if (changeThumbnailBtn) {
        changeThumbnailBtn.addEventListener('click', () => {
            thumbnailInput.click();
        });
    }

    // Update video file info when a file is selected
    function handleVideoFileChange(e) {
        if (e.target.files.length > 0) {
            updateVideoFileName(e.target.files[0]);
        }
    }

    // Update thumbnail preview when a file is selected
    function handleThumbnailChange(e) {
        if (e.target.files.length > 0) {
            updateThumbnailPreview(e.target.files[0]);
        }
    }

    // Update the video file name and file size on the UI
    function updateVideoFileName(file) {
        if (file && videoFileInfo && videoFileName && videoDropZone) {
            const fileSize = (file.size / (1024 * 1024)).toFixed(2); // Convert file size to MB
            videoFileName.textContent = `${file.name} (${fileSize} MB)`; // Display file name and size
            videoFileInfo.classList.remove('hidden'); // Show file info
            videoDropZone.classList.add('hidden'); // Hide the drop zone
            submitButton.disabled = false; // Enable submit button
            submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed'); // Remove disabled styles
            submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700'); // Add enabled styles
        } else if (videoFileInfo && videoDropZone) {
            videoFileInfo.classList.add('hidden'); // Hide file info if no file is selected
            videoDropZone.classList.remove('hidden'); // Show the drop zone
            submitButton.disabled = true; // Disable submit button
            submitButton.classList.add('bg-gray-400', 'cursor-not-allowed'); // Apply disabled styles
            submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700'); // Remove enabled styles
        }
    }

    // Update the thumbnail preview on the UI
    function updateThumbnailPreview(file) {
        if (file && thumbnailPreview && thumbnailPreviewContainer && thumbnailDropZone) {
            const reader = new FileReader();
            reader.onload = function(e) {
                thumbnailPreview.src = e.target.result; // Set preview image
                thumbnailPreviewContainer.classList.remove('hidden'); // Show thumbnail preview
                thumbnailDropZone.classList.add('hidden'); // Hide drop zone
            }
            reader.readAsDataURL(file); // Read the file as data URL
        } else if (thumbnailPreviewContainer && thumbnailDropZone) {
            thumbnailPreviewContainer.classList.add('hidden'); // Hide thumbnail preview if no file is selected
            thumbnailDropZone.classList.remove('hidden'); // Show drop zone
        }
    }

    // Initially disable the submit button until a video is selected
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('bg-gray-400', 'cursor-not-allowed'); // Add disabled styles
        submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700'); // Remove enabled styles
    }
});
