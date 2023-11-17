let express = require('express');
let router = express.Router();
const {createWorker} = require('tesseract.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post("/api/recognize", (req, res) => {
    try {
        // Xử lý hình ảnh ở đây
        console.log('Received image:', req.body);

        const {image} = req.body;

        // Decode base64 image to buffer
        const imageBuffer = Buffer.from(image, 'base64');

        // Use Tesseract.js to recognize text in the image
        (async () => {
            const worker = await createWorker('eng');

            const {data: {text}} = await worker.recognize(imageBuffer);
            console.log(text);
            res.json({text});
            await worker.terminate();
        })();
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Internal server error"});
    }
});

module.exports = router;
