import { Storage } from '@google-cloud/storage';

const project = process.env.PROJECT_ID;
const storage = new Storage({
    projectId: project,
    keyFilename: process.env.SECRET_KEY,
});

// Generates a signed url for uploading an image to the GCP bucket
/**
 *
 * @param {string} user
 * @param {string} filename
 * @param {string} type
 * @returns
 */
const generateUploadSignedUrl = async (userId, filename, type) => {
    const bucketName = process.env.BUCKET_NAME;

    // These options will allow temporary uploading of the file
    const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
        contentType: 'image/jpeg',
    };

    // Get a signed URL for uploading file
    const [url] = await storage.bucket(bucketName).file(`${userId}/${type}/${filename}`).getSignedUrl(options);

    console.log('Generated signed URL');
    //console.log(url);

    return url;
};

/**
 *
 * @param {string} filename It is either the default or the url of the stored image
 */
const deleteImageFromBucket = async (filename) => {
    const bucketName = process.env.BUCKET_NAME;

    // Delete the file
    if (filename !== 'https://www.dinosstorage.com/wp-content/uploads/2021/04/flying-disc-emoji-clipart-md.png') {
        filename = filename.replace(`https://storage.googleapis.com/${bucketName}/`, '');
        await storage.bucket(bucketName).file(filename).delete();
    }
};

export default { generateUploadSignedUrl, deleteImageFromBucket };
