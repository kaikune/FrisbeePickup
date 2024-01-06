let pfpForm = document.getElementById('pfp-form');
let slideshowForm = document.getElementById('slideshow-form');

// Usable for pfp uploads
if (pfpForm) {
    let pfpInput = document.getElementById('pfp-upload');

    pfpForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            let file = pfpInput.files[0];

            if (!file) {
                throw Error('Please select a file!');
            }

            if (file.type != 'image/jpeg') {
                throw Error('Only JPEG allowed!');
            }

            const filename = file.name;
            const signedUrl = await getPfpUrl(filename);

            console.log('Got signed url');

            await handleUpload([file], [signedUrl]);
            //event.currentTarget.submit();
        } catch (err) {
            setError(err);
        }
    });
}

// Usable for slideshow uploads
if (slideshowForm) {
    let slideshowInput = document.getElementById('slideshow-upload');

    slideshowForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            let files = slideshowInput.files;

            console.log('Attempting to submit files');
            if (!files) {
                console.log('No files selected');
                throw Error('Please select a file!');
            }

            for (const file of files) {
                if (file.type != 'image/jpeg') {
                    console.log('File type not jpeg');
                    throw Error('Only JPEG allowed!');
                }
            }

            console.log('Getting filenames');
            let filenames = [];

            for (var i = 0; i < files.length; i++) {
                filenames.push(files[i].name);
            }

            console.log('Got filenames', filenames);
            const signedUrls = await getSlideshowUrls(filenames);

            console.log('Got signed urls');
            console.log('Uploading');

            await handleUpload(files, signedUrls);
            //event.currentTarget.submit();
        } catch (err) {
            setError(err);
        }
    });
}

/**
 * Gets the signed Url for a new pfp
 * @param {string} filename
 */
async function getPfpUrl(filename) {
    console.log(filename);
    const options = {
        filename: filename,
    };

    const signedUrl = await getUrls(options, 'pfp');

    return signedUrl;
}

/**
 * Gets the signed url(s) for new slideshow image(s)
 * @param {[string]} filenames
 */
async function getSlideshowUrls(filenames) {
    console.log('in getSlideshowUrls');
    const options = {
        filenames: filenames,
    };
    const signedUrls = await getUrls(options, 'slideshow');

    return signedUrls;
}

/**
 * Fetches signed urls from server
 * @param {[string]} fileNames
 * @param {string} type Either 'pfp' or 'slideshow'
 * @returns
 */
async function getUrls(options, type) {
    console.log('Getting signed urls');
    const url = `/pictures/${type}`;

    try {
        const response = await fetch(url, {
            mode: 'cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the data received from the server (an array of signed URLs)
    } catch (error) {
        console.error(error);
        return;
    }
}

/**
 *
 * @param {[File]} files
 * @param {[string]} signedUrls
 * @returns
 */
async function handleUpload(files, signedUrls) {
    setMessage('Preparing to upload');
    console.log('Preparing to upload', files);
    try {
        for (let i = 0; i < files.length; i++) {
            const response = await fetch(signedUrls[i], {
                mode: 'cors',
                method: 'PUT',
                body: files[i],
                headers: { 'Content-Type': 'image/jpeg' },
            });

            if (response.ok) {
                setMessage(`File ${files[i].name} uploaded successfully.`);
            } else {
                setError(`File ${files[i].name} upload failed with status ${response.status}.`);
            }
        }
        console.log('Done');
        setMessage('Files done uploading!');
    } catch (error) {
        setError(`File upload failed: ${error.message}`);
        console.log(`Error uploading: ${error.message}`);
        return;
    }
}

function setMessage(message) {
    let messageLabel = document.getElementById('message-label');
    let errorLabel = document.getElementById('error-label');

    if (message.hidden) {
        message.hidden = false;
    }
    if (!errorLabel.hidden) {
        errorLabel.hidden = true;
    }

    messageLabel.innerHTML = message;
}

function setError(error) {
    let messageLabel = document.getElementById('message-label');
    let errorLabel = document.getElementById('error-label');

    if (error.hidden) {
        error.hidden = false;
    }
    if (!messageLabel.hidden) {
        messageLabel.hidden = true;
    }

    errorLabel.innerHTML = error;
}
