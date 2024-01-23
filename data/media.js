import { media } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as helpers from '../helpers.js';

/**
 * Creates the default event page slideshow
 * @returns
 */
const createEventPageSlideshow = async () => {
    const slideshow = {
        _id: new ObjectId(),
        title: 'Event Page Slideshow',
        slideshowImages: [],
    };

    const mediaCollection = await media();

    const insertInfo = await mediaCollection.insertOne(slideshow);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw 'Could not create event page slideshow';
    }

    return { insertSlideshow: true };
};

/**
 * Gets the default event page slideshow object
 * @returns
 */
const getEventPageSlideshow = async () => {
    const mediaCollection = await media();

    const slideshow = await mediaCollection.findOne({ title: 'Event Page Slideshow' });
    if (!slideshow) throw 'Could not find event page slideshow';

    return slideshow;
};

/**
 * Adds an image to the event page slideshow
 * @param {string} imagePath - /type/imageName/imageNum
 * @returns {object}
 */
const addEventPageSlideshowImage = async (imagePath) => {
    console.log(`Adding ${imagePath}`);
    // Input Validation
    helpers.stringHelper(imagePath, 'Image Path', 1, 100);

    const bucketName = process.env.BUCKET_NAME;
    const base = 'https://storage.googleapis.com';

    const url = `${base}/${bucketName}/eventPage/${imagePath}`;

    // Update user info
    const mediaCollection = await media();
    const updatedInfo = await mediaCollection.updateOne({ title: 'Event Page Slideshow' }, { $push: { slideshowImages: url } });

    if (!updatedInfo) throw 'Could not update Event Page successfully';

    return updatedInfo;
};

/**
 * Removes an image from the event page slideshow
 * @param {string} imagePath - /type/imageName/imageNum
 * @returns {object}
 */
const removeEventPageSlideshowImage = async (imagePath) => {
    // Input Validation
    helpers.stringHelper(imagePath, 'Image Path', 1, 100);

    const bucketName = process.env.BUCKET_NAME;
    const base = 'https://storage.googleapis.com';

    const url = `${base}/${bucketName}/eventPage/${imagePath}`;

    // Update user info
    const mediaCollection = await media();
    const updatedInfo = await mediaCollection.updateOne({ title: 'Event Page Slideshow' }, { $pull: { slideshowImages: url } });

    if (!updatedInfo) throw 'Could not update Event Page successfully';

    return updatedInfo;
};

export default {
    createEventPageSlideshow,
    getEventPageSlideshow,
    addEventPageSlideshowImage,
    removeEventPageSlideshowImage,
};
