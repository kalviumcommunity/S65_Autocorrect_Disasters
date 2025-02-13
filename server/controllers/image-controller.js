const Image = require('../models/image-model');

const createImage = async (req, res) => {
    try {
        const image = new Image(req.body);
        await image.save();
        res.status(201).send(image);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getImages = async (req, res) => {
    try {
        const images = await Image.find().populate('user');
        res.status(200).send(images);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = { createImage, getImages };