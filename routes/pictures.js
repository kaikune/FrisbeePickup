import { Router } from 'express';
import { usersData, picturesData } from '../data/index.js';
import * as helpers from '../helpers.js';

const router = Router();

// req in the form of {filenames: ['filename.jpeg']}
router
    .route('/slideshow')
    .get(function (req, res) {
        // TODO
        return res.render('addToSlideshow', {
            /* Stuff here */
        });
    })
    .post(async function (req, res) {
        const filenames = req.body.filenames;
        let urls = [];

        console.log('Generating signed urls');

        // Gets signed urls for each image
        try {
            // Can change to whatever number of images we need
            for (let i = 0; i < filenames.length; i++) {
                urls.push(await picturesData.generateUploadSignedUrl(req.session.user._id, filenames[i], 'slideshow'));
            }
        } catch (err) {
            console.log(err);
            return res.status(500).render('error', { title: 'Error', error: err });
        }

        // Updates image urls in user collection
        try {
            for (let i = 0; i < urls.length; i++) {
                const imagePath = `slideshow/${filenames[i]}`;
                await usersData.addSlideshowImage(req.session.user._id, imagePath);
            }
        } catch (err) {
            console.log(err);
            return res.status(500).render('error', { title: 'Error', error: err });
        }

        // Send array of valid urls
        return res.json(urls);
    })
    .delete(async function (req, res) {
        const fileName = req.body.filename;

        // Updates image urls in user collection
        try {
            const imagePath = `slideshow/${fileName}`;
            await usersData.removeSlideshowImage(req.session.user._id, imagePath);
            await picturesData.deleteImageFromBucket(req.session.user._id, fileName, 'slideshow');
        } catch (err) {
            console.log(err);
            return res.status(500).render('error', { title: 'Error', error: err });
        }

        return res.redirect('/users/' + req.session.user._id);
    });

// req in the form of {filename: 'filename.jpeg'}
router
    .route('/pfp')
    .get(function (req, res) {
        // TODO
        return res.render('updatePfp', {});
    })
    .post(async function (req, res) {
        const filename = req.body.filename;
        const oldFilename = req.session.user.profilePicture;
        let url = '';

        // Gets signed url for each image
        try {
            url = await picturesData.generateUploadSignedUrl(req.session.user._id, filename, 'pfp');
        } catch (err) {
            console.log(err);
            return res.status(500).render('error', { title: 'Error', error: err });
        }

        // Updates image url in user pfp collection
        try {
            const imagePath = `pfp/${filename}`;
            await usersData.editPfp(req.session.user._id, imagePath);
            await picturesData.deleteImageFromBucket(oldFilename);
        } catch (err) {
            console.log(err);
            return res.status(500).render('error', { title: 'Error', error: err });
        }

        // Send array of valid url
        return res.json(url);
    });

export default router;
