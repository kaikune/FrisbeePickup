// JavaScript code to handle the add and delete buttons and the slideshow functionality
var deleteButtons = document.querySelectorAll('.delete-image-button');
var addButton = document.querySelector('.add-image-button');
var images = document.querySelectorAll('.slideshow-image');
var currentIndex = 0;

// Handle delete buttons
deleteButtons.forEach(function (button, index) {
    button.addEventListener('click', async function () {
        // Remove image from slideshow
        try {
            await handleDeletion(images[index].src);
            setMessage('Successfully deleted image');
        } catch (err) {
            console.log(err);
            setError(err);
            return;
        }

        images[index].parentElement.remove();
        images = document.querySelectorAll('.slideshow-image');

        if (currentIndex >= images.length) {
            currentIndex = 0;
        }
    });
});

async function handleDeletion(fullImagePath) {
    const filename = fullImagePath.split('/').pop();

    console.log(filename);
    const response = await fetch('/pictures/slideshow', {
        mode: 'cors',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename: filename,
        }),
    });

    return response;
}

// Handle slideshow functionality
function rotateImages() {
    const imageContainers = document.querySelectorAll('.slideshow-image-container');
    // Hide all images
    imageContainers.forEach(function (image) {
        image.style.display = 'none';
    });
    // Show current image
    imageContainers[currentIndex].style.display = 'block';
    // Move to next image
    currentIndex = (currentIndex + 1) % imageContainers.length;
}

if (imageContainers) {
    rotateImages();
    setInterval(rotateImages, 5000);
}
